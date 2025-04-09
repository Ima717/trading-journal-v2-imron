import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import dayjs from "dayjs";

const TradeTable = ({ trades, isLoading }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerRefresh } = useFilters();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {Array(5).fill().map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse mb-2" />
        ))}
      </div>
    );
  }

  if (!Array.isArray(trades) || trades.filter((t) => t && t.symbol).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-center text-gray-500 dark:text-gray-400">No trades found.</p>
      </div>
    );
  }

  const sortedTrades = useMemo(() => {
    const sortableTrades = [...trades.filter((t) => t && t.symbol)];
    if (sortConfig.key) {
      sortableTrades.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (sortConfig.key === "pnl") return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        return sortConfig.direction === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return sortableTrades;
  }, [trades, sortConfig]);

  const paginatedTrades = sortedTrades.slice(
    (currentPage - 1) * tradesPerPage,
    currentPage * tradesPerPage
  );
  const totalPages = Math.ceil(sortedTrades.length / tradesPerPage);

  const handleDelete = async (tradeId) => {
    if (!user || !window.confirm("Are you sure you want to delete this trade?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "trades", tradeId));
      triggerRefresh();
    } catch (error) {
      console.error("Error deleting trade:", error);
      alert("Failed to delete trade.");
    }
  };

  const handleEdit = (tradeId) => navigate(`/edit-trade/${tradeId}`);
  const handleRowClick = (tradeId) => navigate(`/trade-details/${tradeId}`);
  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Trades</h3>
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-zinc-800 text-left">
            <th onClick={() => requestSort("symbol")} className="p-4 font-medium cursor-pointer">
              Symbol {sortConfig.key === "symbol" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => requestSort("date")} className="p-4 font-medium cursor-pointer">
              Date {sortConfig.key === "date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => requestSort("pnl")} className="p-4 font-medium cursor-pointer">
              P&L {sortConfig.key === "pnl" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th className="p-4 font-medium">Result</th>
            <th className="p-4 font-medium">Notes</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTrades.map((trade) => (
            <tr
              key={trade.id}
              className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
              onClick={() => handleRowClick(trade.id)}
            >
              <td className="p-4">{trade.symbol}</td>
              <td className="p-4">{dayjs(trade.date).format("MMM D, YYYY")}</td>
              <td className={`p-4 ${trade.pnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                ${trade.pnl?.toFixed(2)}
              </td>
              <td className="p-4 capitalize">{trade.result}</td>
              <td className="p-4 text-zinc-600 dark:text-zinc-300">{trade.notes || "-"}</td>
              <td className="p-4 whitespace-nowrap">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(trade.id); }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(trade.id); }}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TradeTable;
