import React from "react";
import { useFilters } from "../context/FilterContext";

const TagSummary = ({ tag, trades }) => {
  const { setSelectedTag } = useFilters();

  const tagTrades = trades.filter((t) => t.tags?.includes(tag));
  const total = tagTrades.length;
  const wins = tagTrades.filter((t) => t.result === "win").length;
  const avgPnL = (
    tagTrades.reduce((acc, t) => acc + Number(t.pnl), 0) / total
  ).toFixed(2);
  const lastDate = tagTrades
    .map((t) => t.date)
    .sort()
    .reverse()[0];

  return (
    <div className="bg-purple-50 border border-purple-300 rounded-xl p-4 my-6 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-purple-800 font-semibold text-md bg-purple-200 px-3 py-1 rounded-full">
          #{tag}
        </span>
        <button
          onClick={() => setSelectedTag(null)}
          className="text-sm text-purple-600 underline hover:text-purple-800"
        >
          Clear ✕
        </button>
      </div>

      <div className="text-sm text-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
        <div>
          <span className="block text-gray-500">Total Trades</span>
          <strong>{total}</strong>
        </div>
        <div>
          <span className="block text-gray-500">Win Rate</span>
          <strong>{((wins / total) * 100).toFixed(1)}%</strong>
        </div>
        <div>
          <span className="block text-gray-500">Average PnL</span>
          <strong>${avgPnL}</strong>
        </div>
        <div>
          <span className="block text-gray-500">Last Trade Date</span>
          <strong>{lastDate}</strong>
        </div>
      </div>
    </div>
  );
};

export default TagSummary;
