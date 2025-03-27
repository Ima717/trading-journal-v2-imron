// /src/pages/ImportTrades.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const ImportTrades = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [trades, setTrades] = useState([]);
  const [errors, setErrors] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [successCount, setSuccessCount] = useState(null);
  const [errorCount, setErrorCount] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    Papa.parse(selectedFile, {
      complete: (result) => {
        const parsedTrades = result.data
          .filter((row) => row.Symbol && row.Date && row.PnL)
          .map((row) => ({
            symbol: row.Symbol || row.ticker || "N/A",
            date: row.Date || row["Open Date"] || new Date().toISOString().split("T")[0],
            pnl: parseFloat(row.PnL || row["Net P&L"] || 0),
            tags: row.Tags ? row.Tags.split(",") : [],
            notes: row.Notes || "",
          }));

        // AI Validation
        const validationErrors = [];
        const tagSuggestions = {};
        parsedTrades.forEach((trade, index) => {
          if (Math.abs(trade.pnl) > 5000) {
            validationErrors.push(`Trade ${index + 1}: P&L of $${trade.pnl} on ${trade.symbol} seems unusually high. Please confirm.`);
          }
          // Simple tag suggestion based on P&L
          if (trade.pnl > 0 && trade.pnl < 100) {
            tagSuggestions[index] = "Scalp";
          } else if (trade.pnl > 100) {
            tagSuggestions[index] = "Swing";
          }
        });

        setErrors(validationErrors);
        setSuggestions(tagSuggestions);
        setTrades(parsedTrades);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const handleImport = async () => {
    if (!user || trades.length === 0) return;

    setIsImporting(true);
    const tradesRef = collection(db, "users", user.uid, "trades");
    let success = 0;
    let errors = 0;

    for (const trade of trades) {
      try {
        await addDoc(tradesRef, {
          symbol: trade.symbol,
          date: trade.date,
          pnl: trade.pnl,
          result: trade.pnl >= 0 ? "win" : "loss",
          tags: trade.tags,
          notes: trade.notes,
        });
        success++;
      } catch (err) {
        console.error("Error adding trade:", err);
        errors++;
      }
    }

    setSuccessCount(success);
    setErrorCount(errors);
    setIsImporting(false);
    setTrades([]);
    setFile(null);
    setErrors([]);
    setSuggestions({});

    if (errors === 0) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800">Import Trades</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mb-4"
            disabled={isImporting}
          />
          {errors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm text-red-600">Validation Warnings:</h3>
              <ul className="list-disc pl-5 text-sm text-red-600">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {trades.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm text-gray-600">Preview Trades:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2 font-medium">Symbol</th>
                      <th className="p-2 font-medium">Date</th>
                      <th className="p-2 font-medium">PnL</th>
                      <th className="p-2 font-medium">Tags</th>
                      <th className="p-2 font-medium">Notes</th>
                      <th className="p-2 font-medium">Suggestions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="p-2 whitespace-nowrap">{trade.symbol}</td>
                        <td className="p-2 whitespace-nowrap">{trade.date}</td>
                        <td className={`p-2 whitespace-nowrap ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          ${trade.pnl}
                        </td>
                        <td className="p-2 whitespace-nowrap">{trade.tags.join(", ")}</td>
                        <td className="p-2 text-gray-600 whitespace-nowrap">{trade.notes}</td>
                        <td className="p-2 text-gray-600 whitespace-nowrap">
                          {suggestions[index] ? `Suggested Tag: ${suggestions[index]}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <button
            onClick={handleImport}
            disabled={trades.length === 0 || isImporting}
            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ${
              trades.length === 0 || isImporting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isImporting ? "Importing..." : `Import ${trades.length} Trades`}
          </button>
          {successCount !== null && (
            <div className="mt-4">
              {successCount > 0 && (
                <div className="text-green-600 font-medium">
                  ✅ Successfully imported {successCount} trades!
                </div>
              )}
              {errorCount > 0 && (
                <div className="text-red-600 font-medium">
                  ❌ Failed to import {errorCount} trades. Please check the data and try again.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportTrades;
