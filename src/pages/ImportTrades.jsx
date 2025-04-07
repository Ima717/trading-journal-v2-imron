import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { collection, writeBatch, doc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";

const ImportTrades = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useFilters();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [trades, setTrades] = useState([]);
  const [errors, setErrors] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [step, setStep] = useState("upload");
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleFileChange = useCallback((selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setStep("preview");

    Papa.parse(selectedFile, {
      complete: ({ data }) => {
        const parsedTrades = data
          .filter((row) => Object.keys(row).length > 1 && row.Status === "Filled")
          .map((row, index) => {
            const symbol = row.Symbol || "N/A";
            const side = row.Side || "Unknown";
            const quantity = parseFloat(row.Filled) || 0;
            const price = parseFloat(row.Price) || 0;
            const date = row["Filled Time"] || new Date().toISOString();
            const amount = side === "Buy" ? -quantity * price : quantity * price; // Cash flow
            const tags = []; // No tags in Webull CSV
            const notes = ""; // No notes in Webull CSV

            return {
              symbol,
              date,
              side,
              quantity,
              price,
              amount,
              commission: 0, // Assume 0 unless provided
              fees: 0, // Assume 0 unless provided
              tags,
              notes,
              originalIndex: index,
            };
          });

        const validationErrors = [];
        const tagSuggestions = {};
        parsedTrades.forEach((trade, index) => {
          if (trade.symbol === "N/A") validationErrors.push(`Row ${trade.originalIndex + 1}: Missing symbol.`);
          if (isNaN(new Date(trade.date).getTime()))
            validationErrors.push(`Row ${trade.originalIndex + 1}: Invalid date (${trade.date}).`);
          if (Math.abs(trade.amount) > 10000)
            validationErrors.push(
              `Row ${trade.originalIndex + 1}: Amount of $${trade.amount} seems unusually high.`
            );
          if (trade.side === "Buy") tagSuggestions[index] = "Long";
          else if (trade.side === "Sell") tagSuggestions[index] = "Short";
        });

        setErrors(validationErrors);
        setSuggestions(tagSuggestions);
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

    // Step 1: Organize trades by symbol and sort by date
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));
    const symbolQueues = {}; // Holds unmatched Buy trades

    for (let i = 0; i < sortedTrades.length; i++) {
      const trade = sortedTrades[i];
      const { symbol, side, quantity, price, commission, fees } = trade;

      if (!symbolQueues[symbol]) symbolQueues[symbol] = [];

      let pnl = 0;

      if (side === "Buy") {
        // Store Buy trades in queue for later matching
        symbolQueues[symbol].push({
          ...trade,
          remainingQty: quantity,
          costPerShare: price,
          totalCost: quantity * price,
        });
      } else if (side === "Sell") {
        let remainingToSell = quantity;
        let realizedPnL = 0;

        while (remainingToSell > 0 && symbolQueues[symbol].length > 0) {
          const buy = symbolQueues[symbol][0];
          const matchQty = Math.min(remainingToSell, buy.remainingQty);

          const buyCost = matchQty * buy.costPerShare;
          const sellRevenue = matchQty * price;
          const matchPnL = sellRevenue - buyCost;

          realizedPnL += matchPnL;

          buy.remainingQty -= matchQty;
          remainingToSell -= matchQty;

          if (buy.remainingQty <= 0) {
            symbolQueues[symbol].shift(); // fully matched
          }
        }

        pnl = Number.isNaN(realizedPnL) ? 0 : realizedPnL - commission - fees;
      }

      // Add trade with calculated P&L
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
        batch = writeBatch(db); // reset for next chunk
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-6 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-inter">
            Import Trades
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl rounded-2xl p-8 transition-all duration-300">
          {step === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50"
            >
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-gray-600 dark:text-gray-300">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 4v8m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                  <p className="text-lg font-medium">
                    Drag & drop your CSV here or{" "}
                    <span className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      browse
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Supports .csv files from your broker
                  </p>
                </div>
              </label>
            </div>
          )}

          {step === "preview" && (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white tracking-tight">
                  Preview {trades.length} Trades
                </h2>
                {errors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/30 rounded-lg shadow-inner">
                    <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
                      Validation Warnings:
                    </h3>
                    <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-400 mt-2">
                      {errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative overflow-x-auto max-h-[500px] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 sticky top-0 shadow-sm">
                    <tr>
                      <th className="p-4 font-semibold text-left">Symbol</th>
                      <th className="p-4 font-semibold text-left">Date</th>
                      <th className="p-4 font-semibold text-left">Side</th>
                      <th className="p-4 font-semibold text-left">Qty</th>
                      <th className="p-4 font-semibold text-left">Price</th>
                      <th className="p-4 font-semibold text-left">Amount</th>
                      <th className="p-4 font-semibold text-left">Tags</th>
                      <th className="p-4 font-semibold text-left">Notes</th>
                      <th className="p-4 font-semibold text-left">Suggestions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, i) => (
                      <tr
                        key={i}
                        className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                      >
                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                          {trade.symbol}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{trade.date}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{trade.side}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{trade.quantity}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">
                          ${trade.price.toFixed(2)}
                        </td>
                        <td className={`p-4 font-medium ${trade.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                          ${trade.amount.toFixed(2)}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{trade.tags.join(", ")}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{trade.notes}</td>
                        <td className="p-4">
                          {suggestions[i] && (
                            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                              {suggestions[i]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setStep("upload")}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  Import Now
                </button>
              </div>
            </>
          )}

          {step === "importing" && (
            <div className="text-center py-12">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                Importing {trades.length} trades...{" "}
                <span className="text-blue-500 dark:text-blue-400">{progress}%</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Please wait while we process your data.
              </p>
              {importError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-4">{importError}</p>
              )}
            </div>
          )}

          {importResult && (
            <div className="mt-8 p-6 bg-gray-50/80 dark:bg-gray-900/80 rounded-xl shadow-lg animate-fade-slide-down">
              {importResult.success > 0 && (
                <p className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Successfully imported {importResult.success} trades!
                </p>
              )}
              {importResult.errors > 0 && (
                <p className="text-lg font-semibold text-red-600 dark:text-red-400 mt-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Failed to import {importResult.errors} trades. Check your data and try again.
                </p>
              )}
              {importError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-4">{importError}</p>
              )}
              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportTrades;
