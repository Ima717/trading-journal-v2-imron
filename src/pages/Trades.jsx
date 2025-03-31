// src/pages/Trades.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";

const Trades = () => {
  const { user } = useAuth();
  const { filters, triggerRefresh } = useFilters();
  const [trades, setTrades] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) {
        setError("User not logged in.");
        return;
      }

      try {
        console.log("Fetching trades for user:", user.uid); // Debug log
        const tradesCollection = collection(db, "users", user.uid, "trades");
        const tradesSnapshot = await getDocs(tradesCollection);
        const tradesList = tradesSnapshot.docs.map((doc) => {
          const data = doc.data();
          // Ensure trade object has required fields
          return {
            id: doc.id,
            symbol: data.symbol || "Unknown",
            instrumentType: data.instrumentType || "Unknown",
            date: data.date || "",
            quantity: data.quantity || 0,
            entryPrice: data.entryPrice || 0,
            exitPrice: data.exitPrice || 0,
            pnl: data.pnl || 0,
            result: data.result || "Unknown",
            playbook: data.playbook || "",
            ...data, // Include any additional fields
          };
        });

        console.log("Fetched trades:", tradesList); // Debug log

        // Filter trades with safety checks
        const filteredTrades = tradesList.filter((trade) => {
          if (!trade) return false; // Skip undefined trades
          const matchesSymbol = filters.symbol ? trade.symbol === filters.symbol : true;
          const matchesResult = filters.result ? trade.result === filters.result : true;
          const matchesDate = filters.date ? trade.date === filters.date : true;
          return matchesSymbol && matchesResult && matchesDate;
        });

        setTrades(filteredTrades);
        setError(null);
      } catch (err) {
        console.error("Error fetching trades:", err);
        setError("Failed to fetch trades: " + err.message);
      }
    };

    fetchTrades();
  }, [user, filters, triggerRefresh]);

  const handleEdit = (id) => {
    if (!id) {
      console.error("Trade ID is undefined");
      return;
    }
    navigate(`/edit-trade/${id}`);
  };

  const handleDelete = async (id) => {
    if (!user || !id) return;
    if (!window.confirm("Are you sure you want to delete this trade?")) return;

    try {
      const tradeRef = doc(db, "users", user.uid, "trades", id);
      await deleteDoc(tradeRef);
      setTrades(trades.filter((trade) => trade.id !== id));
      triggerRefresh();
    } catch (err) {
      console.error("Error deleting trade:", err);
      setError("Failed to delete trade: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2 sm:mb-0">Trades</h1>
          <button
            onClick={() => navigate("/import-trades")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Import Trades
          </button>
        </div>
        <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 sm:p-6">
          {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
          {trades.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">No trades found.</p>}
          {trades.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instrument Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entry Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P&L</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Result</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Playbook</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
                  {trades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.symbol}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.instrumentType}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.quantity}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.entryPrice}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.exitPrice}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.pnl}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.result}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.playbook}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <button
                          onClick={() => handleEdit(trade.id)}
                          className="text-blue-500 hover:text-blue-600 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(trade.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trades;
