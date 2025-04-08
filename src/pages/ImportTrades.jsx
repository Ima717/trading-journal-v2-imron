import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { collection, writeBatch, doc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";

// Futures lookup table (common contracts)
const FUTURES_SPECS = {
  "/ES": { contractSize: 50, tickValue: 0.25 }, // E-mini S&P 500
  "/CL": { contractSize: 1000, tickValue: 0.01 }, // Crude Oil
  "/GC": { contractSize: 100, tickValue: 0.10 }, // Gold
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
    if (symbol.startsWith("/")) return "futures"; // e.g., /ESZ25
    if (/^[A-Z]+[0-9]{6}[CP][0-9]+$/.test(symbol)) return "option"; // e.g., AAPL250321C155
    return "stock"; // Default to stock
  };

  const parseOptionDetails = (symbol) => {
    const match = symbol.match(/([A-Z]+)([0-9]{6})([CP])([0-9]+)/);
    if (!match) return { baseSymbol: symbol, expiration: null, strike: null, optionType: null };
    const [, baseSymbol, date, optionType, strike] = match;
    const expiration = `20${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4, 6)}`;
    return { baseSymbol, expiration, strike: parseFloat(strike), optionType };
  };

  const handleFileChange = useCallback((selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setStep("preview");

    Papa.parse(selectedFile, {
      complete: ({ data }) => {
        const parsedTrades = data
          .filter((row) => row.Status === "Filled" || row.Action || row.Side || row.Type) // Flexible filter
          .map((row, index) => {
            // Normalize column names
            const symbol = row.Symbol || row.Ticker || "N/A";
            const side = row.Side || row.Action || row.Type || "Unknown";
            const quantity = parseFloat(row.Filled || row.Quantity || 0);
            const price = parseFloat(row.Price || 0);
            const date = row["Filled Time"] || row.Date || row["Trade Date"] || new Date().toISOString();
            const commission = parseFloat(row.Commission || 0);
            const fees = parseFloat(row.Fees || 0);
            const description = row.Description || "";

            // Detect instrument type
            const instrumentType = row.InstrumentType || detectInstrumentType(symbol);
            let multiplier = 1;
            let contractSize = 1;
            let tickValue = 1;
            let strike = null;
            let expiration = null;
            let baseSymbol = symbol;

            if (instrumentType === "option") {
              multiplier = 100; // Standard US equity options
              const optionDetails = parseOptionDetails(symbol);
              baseSymbol = optionDetails.baseSymbol;
              strike = optionDetails.strike;
              expiration = optionDetails.expiration;
            } else if (instrumentType === "futures") {
              const spec = FUTURES_SPECS[symbol.split(/[0-9]/)[0]] || { contractSize: 1, tickValue: 1 };
              contractSize = spec.contractSize;
              tickValue = spec.tickValue;
            }

            const amount = side === "Buy" ? -quantity * price * multiplier : quantity * price * multiplier;

            return {
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
              notes: description,
              originalIndex: index,
            };
          });

        const validationErrors = [];
        parsedTrades.forEach((trade) => {
          if (trade.symbol === "N/A") validationErrors.push(`Row ${trade.originalIndex + 1}: Missing symbol`);
          if (isNaN(new Date(trade.date).getTime()))
            validationErrors.push(`Row ${trade.originalIndex + 1}: Invalid date (${trade.date})`);
          if (Math.abs(trade.amount) > 100000)
            validationErrors.push(`Row ${trade.originalIndex + 1}: Amount $${trade.amount} seems unusually high`);
        });

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

    // Organize trades by matching key
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));
    const tradeQueues = {};

    for (let i = 0; i < sortedTrades.length; i++) {
      const trade = sortedTrades[i];
      const { symbol, instrumentType, side, quantity, price, commission, fees, strike, expiration } = trade;

      // Matching key: specific for options/futures
      const matchKey =
        instrumentType === "option"
          ? `${symbol}-${strike}-${expiration}`
          : instrumentType === "futures"
          ? symbol
          : trade.baseSymbol;

      if (!tradeQueues[matchKey]) tradeQueues[matchKey] = [];

      let pnl = 0;

      if (side === "Buy") {
        tradeQueues[matchKey].push({ ...trade, remainingQty: quantity });
      } else if (side === "Sell") {
        let remainingToSell = quantity;
        let realizedPnL = 0;

        while (remainingToSell > 0 && tradeQueues[matchKey].length > 0) {
          const buy = tradeQueues[matchKey][0];
          const matchQty = Math.min(remainingToSell, buy.remainingQty);

          if (trade.instrumentType === "futures") {
            const priceDiff = price - buy.price;
            realizedPnL += priceDiff * matchQty * trade.contractSize * trade.tickValue;
          } else {
            const buyCost = matchQty * buy.price * trade.multiplier;
            const sellRevenue = matchQty * price * trade.multiplier;
            realizedPnL += sellRevenue - buyCost;
          }

          buy.remainingQty -= matchQty;
          remainingToSell -= matchQty;

          if (buy.remainingQty <= 0) {
            const buyDoc = doc(tradesRef);
            batch.set(buyDoc, {
              ...buy,
              pnl: realizedPnL - (commission + fees) / 2, // Split costs
              entryTime: buy.date,
              createdAt: new Date().toISOString(),
            });
            tradeQueues[matchKey].shift();
            success++;
          } else {
            tradeQueues[matchKey][0] = { ...buy };
          }
        }

        pnl = realizedPnL - (commission + fees) / 2;
      }

      const tradeDoc = doc(tradesRef);
      batch.set(tradeDoc, {
        ...trade,
        pnl,
        entryTime: trade.date,
        createdAt: new Date().toISOString(),
      });

      if ((i + 1) % batchSize === 0 || i === sortedTrades.length - 1) {
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

  // UI remains largely unchanged; simplified for brevity
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Import Trades</h1>
        {step === "upload" && (
          <div onDrop={handleDrop} onDragOver={handleDragOver}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e.target.files[0])}
              id="file-upload"
            />
            <label htmlFor="file-upload">Drag & drop or browse CSV</label>
          </div>
        )}
        {step === "preview" && (
          <>
            <h2>Preview {trades.length} Trades</h2>
            {errors.length > 0 && (
              <ul>
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            )}
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Date</th>
                  <th>Side</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, i) => (
                  <tr key={i}>
                    <td>{trade.symbol}</td>
                    <td>{trade.date}</td>
                    <td>{trade.side}</td>
                    <td>{trade.quantity}</td>
                    <td>${trade.price.toFixed(2)}</td>
                    <td>${trade.amount.toFixed(2)}</td>
                    <td>{trade.instrumentType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleImport}>Import Now</button>
          </>
        )}
        {step === "importing" && <div>Importing... {progress}%</div>}
        {importResult && (
          <div>
            <p>Imported {importResult.success} trades</p>
            {importResult.errors > 0 && <p>Failed {importResult.errors} trades</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportTrades;
