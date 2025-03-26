import React, { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const ImportTrades = () => {
  const { user } = useAuth();
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [successCount, setSuccessCount] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  const handleImport = async () => {
    if (!user || csvData.length === 0) return;
    const tradesRef = collection(db, "users", user.uid, "trades");
    let success = 0;

    for (let row of csvData) {
      const trade = {
        symbol: row.symbol || row.ticker || "N/A",
        pnl: parseFloat(row.pnl || row.PnL || row["Net P&L"] || 0),
        result: row.result || (parseFloat(row.pnl) >= 0 ? "win" : "loss"),
        date: row.date || row["Open Date"] || new Date().toISOString().split("T")[0],
        tags: row.tags ? row.tags.split(",") : [],
        notes: row.notes || "",
      };

      try {
        await addDoc(tradesRef, trade);
        success++;
      } catch (err) {
        console.error("Error adding trade:", err);
      }
    }

    setSuccessCount(success);
    setCsvData([]);
    setFileName(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Import Your Trades (CSV)</h1>

      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {fileName && (
        <div className="mt-4">
          <h2 className="font-semibold">Preview: {fileName}</h2>
          <table className="w-full mt-2 text-sm border">
            <thead>
              <tr>
                {Object.keys(csvData[0] || {}).map((key, i) => (
                  <th key={i} className="border px-2 py-1 bg-gray-100">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-t">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border px-2 py-1">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleImport}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Import {csvData.length} Trades
          </button>
        </div>
      )}

      {successCount !== null && (
        <div className="mt-4 text-green-600 font-medium">
          ✅ Successfully imported {successCount} trades!
        </div>
      )}
    </div>
  );
};

export default ImportTrades;
