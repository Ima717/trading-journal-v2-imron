// /src/pages/Trades.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";

const Trades = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useFilters();
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const tradesRef = collection(db, "users", user.uid, "trades");
    const q = query(tradesRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tradesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrades(tradesData);
        setError(null);
      },
      (err) => {
        console.error("Error fetching trades:", err);
        setError("Failed to load trades. Please try again.");
      }
    );

    return () => unsubscribe();
  }, [user, triggerRefresh]);

  const handleEdit = (tradeId) => {
    navigate(`/edit-trade/${tradeId}`);
  };

  const handleDelete = async (tradeId) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this trade?")) return;

    try {
      const tradeRef = doc(db, "users", user.uid, "trades", tradeId);
      await deleteDoc(tradeRef);
      triggerRefresh();
    } catch (error) {
      console.error("Error deleting trade:", error);
      alert("Failed to delete trade. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2 sm:mb-0">Trades</h1>
          <button
            onClick={() => navigate("/add-trade")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Trade
          </button>
        </div>
        {trades.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4">
            <p className="text-center text-gray-500 dark:text-gray-400">No trades found. Add a trade to get started!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-zinc-800 text-left">
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Symbol</th>
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Instrument</th>
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Date</th>
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Quantity</th>
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Entry Price</th>
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Exit Price</th>
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">P&L</th>
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Result</th>
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Playbook</th>
                  <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                  >
                    <td className="p-2 text-zinc-800 dark:text-zinc-100">{trade.symbol || "N/A"}</td>
                    <td className="p-2 text-zinc-800 dark:text-zinc-100">{trade.instrumentType || "N/A"}</td>
                    <td className="p-2 text-zinc-800 dark:text-zinc-100">{trade.date || "N/A"}</td>
                    <td className="p-2 text-zinc-800 dark:text-zinc-100">{trade.quantity || 0}</td>
                    <td className="p-2 text-zinc-800 dark:text-zinc-100">
                      ${typeof trade.entryPrice === "number" ? trade.entryPrice.toFixed(2) : "0.00"}
                    </td>
                    <td className="p-2 text-zinc-800 dark:text-zinc-100">
                      ${typeof trade.exitPrice === "number" ? trade.exitPrice.toFixed(2) : "0.00"}
                    </td>
                    <td className={`p-2 ${trade.pnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                      ${typeof trade.pnl === "number" ? trade.pnl.toFixed(2) : "0.00"}
                    </td>
                    <td className="p-2 capitalize text-zinc-800 dark:text-zinc-100">{trade.result || "N/A"}</td>
                    <td className="p-2 text-zinc-800 dark:text-zinc-100">{trade.playbook || "N/A"}</td>
                    <td className="p-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(trade.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(trade.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors duration-200"
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
  );
};

export default Trades;
