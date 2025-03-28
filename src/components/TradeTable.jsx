// /src/components/TradeTable.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";

const TradeTable = ({ trades }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerRefresh } = useFilters();

  if (!trades || trades.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 mt-10 animate-fade-in">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No trades found for this filter.
        </p>
      </div>
    );
  }

  const handleDelete = async (tradeId) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this trade?")) return;

    try {
      const tradeRef = doc(db, "users", user.uid, "trades", tradeId);
      await deleteDoc(tradeRef);
      triggerRefresh(); // Refresh dashboard data after deletion
    } catch (error) {
      console.error("Error deleting trade:", error);
      alert("Failed to delete trade. Please try again.");
    }
  };

  const handleEdit = (tradeId) => {
    navigate(`/edit-trade/${tradeId}`);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 mt-10 overflow-x-auto animate-fade-in">
      <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Trades</h3>
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-zinc-800 text-left">
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Symbol</th>
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Date</th>
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">PnL</th>
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Result</th>
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Notes</th>
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, i) => (
            <tr
              key={i}
              className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
            >
              <td className="p-2 text-zinc-800 dark:text-zinc-100">{trade.symbol}</td>
              <td className="p-2 text-zinc-800 dark:text-zinc-100">{trade.date}</td>
              <td
                className={`p-2 ${
                  trade.pnl >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                ${trade.pnl}
              </td>
              <td className="p-2 capitalize text-zinc-800 dark:text-zinc-100">{trade.result}</td>
              <td className="p-2 text-zinc-600 dark:text-zinc-300">{trade.notes}</td>
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
  );
};

export default TradeTable;
