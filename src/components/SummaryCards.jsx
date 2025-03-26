import React from "react";
import MetricCard from "./MetricCard";

const SummaryCards = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return null;
  }

  const totalTrades = trades.length;
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = trades.filter((t) => t.result === "win").length;
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;
  const avgPnL = totalTrades ? (totalPnL / totalTrades).toFixed(2) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
      <MetricCard title="Total Trades" value={totalTrades} />
      <MetricCard title="Total PnL" value={`$${totalPnL}`} />
      <MetricCard title="Win Rate" value={`${winRate}%`} />
      <MetricCard title="Avg PnL/Trade" value={`$${avgPnL}`} />
    </div>
  );
};

export default SummaryCards;
