import React from "react";

const TagSummary = ({ tag, trades }) => {
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
    <div className="bg-white rounded-xl shadow p-4 my-4 border border-purple-300">
      <h3 className="text-xl font-bold text-purple-700 mb-2">🔍 Tag: {tag}</h3>
      <div className="text-sm text-gray-700 space-y-1">
        <div>Total Trades: <strong>{total}</strong></div>
        <div>Win Rate: <strong>{((wins / total) * 100).toFixed(1)}%</strong></div>
        <div>Average PnL: <strong>${avgPnL}</strong></div>
        <div>Last Trade Date: <strong>{lastDate}</strong></div>
      </div>
    </div>
  );
};

export default TagSummary;
