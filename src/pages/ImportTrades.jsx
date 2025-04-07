import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { collection, writeBatch } from "firebase/firestore";
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
  const [step, setStep] = useState("upload"); // upload, preview, importing
  const [progress, setProgress] = useState(0); // 0-100 for import progress
  const [importResult, setImportResult] = useState(null); // { success, errors }

  // Handle file drop or input
  const handleFileChange = useCallback((selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setStep("preview");

    Papa.parse(selectedFile, {
      complete: ({ data }) => {
        const parsedTrades = data
          .filter((row) => Object.keys(row).length > 1) // Skip empty rows
          .map((row, index) => {
            const symbol = row.Symbol || row.Ticker || row.Stock || "N/A";
            const date =
              row.Date ||
              row["Open Date"] ||
              row["Trade Date"] ||
              new Date().toISOString().split("T")[0];
            const pnl = parseFloat(row.PnL || row["Net P&L"] || row.Profit || 0) || 0;
            const tags = row.Tags ? row.Tags.split(",").map((t) => t.trim()) : [];
            const notes = row.Notes || row.Comments || "";

            return { symbol, date, pnl, tags, notes, originalIndex: index };
          });

        // Validation & Suggestions
        const validationErrors = [];
        const tagSuggestions = {};
        parsedTrades.forEach((trade, index) => {
          if (!trade.symbol || trade.symbol === "N/A") {
            validationErrors.push(`Row ${trade.originalIndex + 1}: Missing symbol.`);
          }
          if (isNaN(new Date(trade.date).getTime())) {
            validationErrors.push(`Row ${trade.originalIndex + 1}: Invalid date (${trade.date}).`);
          }
          if (Math.abs(trade.pnl) > 5000) {
            validationErrors.push(
              `Row ${trade.originalIndex + 1}: P&L of $${trade.pnl} on ${trade.symbol} seems unusually high.`
            );
          }
          if (trade.pnl > 0 && trade.pnl < 100) tagSuggestions[index] = "Scalp";
          else if (trade.pnl > 100) tagSuggestions[index] = "Swing";
          else if (trade.pnl < 0) tagSuggestions[index] = "Review";
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

  // Batch import to Firestore
  const handleImport = async () => {
    if (!user || trades.length === 0) return;
    setStep("importing");
    setProgress(0);

    const tradesRef = collection(db, "users", user.uid, "trades");
    const batch = writeBatch(db);
    let success = 0;
    const batchSize = 500; // Firestore batch limit

    for (let i = 0; i < trades.length; i++) {
      const trade = trades[i];
      batch.set(tradesRef.doc(), {
        symbol: trade.symbol,
        date: trade.date,
        pnl: trade.pnl,
        result: trade.pnl >= 0 ? "win" : "loss",
        tags: trade.tags.concat(suggestions[i] || []),
        notes: trade.notes,
      });

      if ((i + 1) % batchSize === 0 || i === trades.length - 1) {
        try {
          await batch.commit();
          success += Math.min(batchSize, i + 1 - success);
          setProgress(Math.round(((i + 1) / trades.length) * 100));
          batch.clear();
        } catch (err) {
          console.error("Batch error:", err);
          setImportResult({ success, errors: trades.length - success });
          return;
        }
      }
    }

    setImportResult({ success, errors: trades.length - success });
    triggerRefresh();
  };

  // Drag-and-drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">Import Trades</h1>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 transition-all duration-300">
          {step === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
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
                    className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500"
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
                  <p>Drag & drop your CSV here or <span className="text-blue-500 hover:underline">browse</span></p>
                </div>
              </label>
            </div>
          )}

          {step === "preview" && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Preview {trades.length} Trades
                </h2>
                {errors.length > 0 && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h3 className="text-sm text-red-600 dark:text-red-400">Validation Warnings:</h3>
                    <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-400">
                      {errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto max-h-96 border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr className="text-left text-gray-600 dark:text-gray-300">
                      <th className="p-3 font-medium">Symbol</th>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">PnL</th>
                      <th className="p-3 font-medium">Tags</th>
                      <th className="p-3 font-medium">Notes</th>
                      <th className="p-3 font-medium">Suggestions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, i) => (
                      <tr
                        key={i}
                        className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="p-3">{trade.symbol}</td>
                        <td className="p-3">{trade.date}</td>
                        <td className={`p-3 ${trade.pnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                          ${trade.pnl.toFixed(2)}
                        </td>
                        <td className="p-3">{trade.tags.join(", ")}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{trade.notes}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">
                          {suggestions[i] && (
                            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                              {suggestions[i]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setStep("upload")}
                  className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Import Now
                </button>
              </div>
            </>
          )}

          {step === "importing" && (
            <div className="text-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Importing {trades.length} trades... ({progress}%)
              </p>
            </div>
          )}

          {importResult && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg animate-fade-slide-down">
              {importResult.success > 0 && (
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✅ Successfully imported {importResult.success} trades!
                </p>
              )}
              {importResult.errors > 0 && (
                <p className="text-red-600 dark:text-red-400 font-medium mt-2">
                  ❌ Failed to import {importResult.errors} trades. Check your data and try again.
                </p>
              )}
              <button
                onClick={() => navigate("/")}
                className="mt-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
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
