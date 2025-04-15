import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { collection, writeBatch, doc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";

// Futures lookup table (expanded for robustness)
const FUTURES_SPECS = {
  "/ES": { contractSize: 50, tickValue: 0.25 },
  "/CL": { contractSize: 1000, tickValue: 0.01 },
  "/GC": { contractSize: 100, tickValue: 0.10 },
  "/NQ": { contractSize: 20, tickValue: 0.25 },
  "/YM": { contractSize: 5, tickValue: 1.00 },
};

const ImportTrades = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useFilters();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [trades, setTrades] = useState([]);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState("upload");
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);

  const detectInstrumentType = (symbol) => {
    if (symbol.startsWith("/")) return "futures";
    if (/^[A-Z]+[0-9]{6}[CP][0-9]+$/.test(symbol)) return "option";
    return "stock";
  };

  const parseOptionDetails = (symbol) => {
    const match = symbol.match(/([A-Z]+)([0-9]{6})([CP])([0-9]+)/);
    if (!match) return { baseSymbol: symbol, expiration: null, strike: null };
    const [, baseSymbol, date, , strike] = match;
    const expiration = `20${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4, 6)}`;
    return { baseSymbol, expiration, strike: parseFloat(strike) };
  };

  const handleFileChange = useCallback((selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setStep("preview");
    setErrors([]);
    setTrades([]);

    Papa.parse(selectedFile, {
      complete: ({ data }) => {
        console.log("Raw CSV rows:", data.length, data);
        const uniqueTrades = new Map();
        const validationErrors = [];

        data
          .filter((row) => row.Symbol && (row.Side || row.Action))
          .forEach((row, index) => {
            const symbol = row.Symbol || row.Ticker || "N/A";
            const side = (row.Side || row.Action || "Unknown").toLowerCase();
            if (side !== "buy" && side !== "sell") return;
            const quantity = parseFloat(row.Filled || row.Quantity) || 0;
            const price = parseFloat(row.Price) || 0;
            const date = row["Filled Time"] || row.Date || row["Trade Date"] || new Date().toISOString();
            const commission = parseFloat(row.Commission) || 0;
            const fees = parseFloat(row.Fees) || 0;

            const uniqueKey = `${symbol}-${side}-${date}`;
            if (uniqueTrades.has(uniqueKey)) {
              console.log(`Duplicate found: ${uniqueKey}`);
              return;
            }

            const instrumentType = detectInstrumentType(symbol);
            let multiplier = 1;
            let contractSize = 1;
            let tickValue = 1;
            let strike = null;
            let expiration = null;
            let baseSymbol = symbol;

            if (instrumentType === "option") {
              multiplier = 100;
              const { baseSymbol: bs, expiration: exp, strike: st } = parseOptionDetails(symbol);
              baseSymbol = bs;
              expiration = exp;
              strike = st;
            } else if (instrumentType === "futures") {
              const futuresRoot = symbol.split(/[0-9]/)[0];
              const spec = FUTURES_SPECS[futuresRoot] || { contractSize: 1, tickValue: 1 };
              contractSize = spec.contractSize;
              tickValue = spec.tickValue;
            }

            const amount = side === "buy" ? -quantity * price * multiplier : quantity * price * multiplier;

            if (symbol === "N/A") validationErrors.push(`Row ${index + 1}: Missing symbol`);
            if (isNaN(new Date(date).getTime())) validationErrors.push(`Row ${index + 1}: Invalid date (${date})`);
            if (quantity <= 0 || price <= 0) validationErrors.push(`Row ${index + 1}: Invalid quantity or price`);

            uniqueTrades.set(uniqueKey, {
              symbol,
              baseSymbol,
              date,
              side,
              quantity,
              price,
              amount,
              commission,
              fees,
              instrumentType,
              multiplier,
              contractSize,
              tickValue,
              strike,
              expiration,
              tags: [],
              notes: row.Description || "",
            });
          });

        const parsedTrades = Array.from(uniqueTrades.values());
        console.log("Parsed trades:", parsedTrades.length, parsedTrades);
        setErrors(validationErrors);
        setTrades(parsedTrades);
      },
      header: true,
      skipEmptyLines: true,
      error: (err) => setErrors([`CSV parsing failed: ${err.message}`]),
    });
  }, []);

  const handleImport = async () => {
    if (!user || trades.length === 0) {
      setImportError("No user logged in or no trades to import.");
      return;
    }

    setStep("importing");
    setProgress(0);
    setImportError(null);

    const tradesRef = collection(db, "users", user.uid, "trades");
    let batch = writeBatch(db);
    let success = 0;
    const batchSize = 50;
    const writtenDocs = new Set(); // Track written document IDs to prevent duplicates

    const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));
    console.log("Total trades to import:", sortedTrades.length);
    const tradeQueues = {};

    for (let i = 0; i < sortedTrades.length; i++) {
      const trade = sortedTrades[i];
      const { symbol, instrumentType, side, quantity, price, commission, fees, strike, expiration } = trade;
      const matchKey =
        instrumentType === "option" ? `${symbol}-${strike}-${expiration}` :
        instrumentType === "futures" ? symbol : trade.baseSymbol;

      if (!tradeQueues[matchKey]) tradeQueues[matchKey] = [];

      let pnl = 0;

      if (side === "buy") {
        tradeQueues[matchKey].push({ ...trade, remainingQty: quantity });
        pnl = 0;
      } else if (side === "sell") {
        let remainingToSell = quantity;
        let realizedPnL = 0;

        while (remainingToSell > 0 && tradeQueues[matchKey].length > 0) {
          const buy = tradeQueues[matchKey][0];
          const matchQty = Math.min(remainingToSell, buy.remainingQty);

          if (instrumentType === "futures") {
            realizedPnL += (price - buy.price) * matchQty * trade.contractSize * trade.tickValue;
          } else {
            realizedPnL += (matchQty * price - matchQty * buy.price) * trade.multiplier;
          }

          const totalCosts = commission + fees;
          const sellPnL = realizedPnL - totalCosts;

          buy.remainingQty -= matchQty;
          remainingToSell -= matchQty;

          if (buy.remainingQty <= 0) {
            const buyDoc = doc(tradesRef);
            if (!writtenDocs.has(buyDoc.id)) {
              batch.set(buyDoc, {
                ...buy,
                pnl: 0,
                entryTime: buy.date,
                createdAt: new Date().toISOString(),
              });
              writtenDocs.add(buyDoc.id);
              success++;
            }
            tradeQueues[matchKey].shift();
          } else {
            tradeQueues[matchKey][0] = { ...buy };
          }

          pnl = sellPnL;
        }
      }

      const tradeDoc = doc(tradesRef);
      if (!writtenDocs.has(tradeDoc.id)) {
        console.log("Trade saved:", tradeDoc.id, { symbol, side, pnl });
        batch.set(tradeDoc, {
          ...trade,
          side: side.toLowerCase(),
          pnl,
          entryTime: trade.date,
          createdAt: new Date().toISOString(),
        });
        writtenDocs.add(tradeDoc.id);
      } else {
        console.log("Skipped duplicate write:", tradeDoc.id, { symbol, side });
      }

      if ((i + 1) % batchSize === 0 || i === sortedTrades.length - 1) {
        console.log("Committing batch, success:", success);
        await batch.commit();
        success += Math.min(batchSize, i + 1 - success);
        batch = writeBatch(db);
        setProgress(Math.round(((i + 1) / trades.length) * 100));
      }
    }

    setImportResult({ success, errors: trades.length - success });
    triggerRefresh();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-100 to-purple-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Import Your Trades
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all duration-200 shadow-md"
          >
            Back to Dashboard
          </button>
        </div>

        {step === "upload" && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-4 border-dashed border-indigo-300 dark:border-indigo-600 rounded-2xl p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300"
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-gray-700 dark:text-gray-200">
                <svg
                  className="w-20 h-20 mx-auto mb-4 text-indigo-400 dark:text-indigo-500 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 4v8m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <p className="text-xl font-semibold">
                  Drag & Drop or{" "}
                  <span className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Browse
                  </span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Upload your broker CSV file (e.g., Webull, Robinhood)
                </p>
              </div>
            </label>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Previewing {trades.length} Trades
            </h2>
            {errors.length > 0 && (
              <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-xl shadow-inner">
                <h3 className="text-md font-medium text-red-700 dark:text-red-300">Warnings:</h3>
                <ul className="list-disc pl-6 text-sm text-red-600 dark:text-red-400">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="overflow-x-auto max-h-[60vh] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
              <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
                <thead className="sticky top-0 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  <tr>
                    <th className="p-4 font-semibold">Symbol</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Side</th>
                    <th className="p-4 font-semibold">Qty</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-800/20 transition-colors"
                    >
                      <td className="p-4 font-medium">{trade.symbol}</td>
                      <td className="p-4">{trade.date}</td>
                      <td className="p-4 capitalize">{trade.side}</td>
                      <td className="p-4">{trade.quantity}</td>
                      <td className="p-4">${!isNaN(trade.price) ? Number(trade.price).toFixed(2) : "0.00"}</td>
                      <td className="p-4">${!isNaN(trade.amount) ? Number(trade.amount).toFixed(2) : "0.00"}</td>
                      <td className="p-4 capitalize">{trade.instrumentType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setStep("upload")}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all"
              >
                Import Now
              </button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="text-center py-16">
            <div className="w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6 overflow-hidden">
              <div
                className="bg-indigo-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-200">
              Importing {trades.length} trades... <span className="text-indigo-500">{progress}%</span>
            </p>
          </div>
        )}

        {importResult && (
          <div className="mt-8 p-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl shadow-lg animate-fade-in">
            {importResult.success > 0 && (
              <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Successfully imported {importResult.success} trades!
              </p>
            )}
            {importResult.errors > 0 && (
              <p className="text-xl font-semibold text-red-600 dark:text-red-400 mt-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Failed to import {importResult.errors} trades.
              </p>
            )}
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportTrades;
