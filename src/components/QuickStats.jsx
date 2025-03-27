// /src/components/QuickStats.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

const QuickStats = () => {
  const { filteredTrades } = useFilters();

  const totalTrades = filteredTrades.length || 0;
  const winRate = totalTrades
    ? (filteredTrades.filter((t) => t.pnl > 0).length / totalTrades) * 100
    : 0;
  const avgPnL = totalTrades
    ? filteredTrades.reduce((sum, t) => sum + Number(t.pnl), 0) / totalTrades
    : 0;

  const stats = [
    { label: "Total Trades", value: totalTrades },
    { label: "Win Rate", value: `${winRate.toFixed(2)}%` },
    { label: "Avg PnL", value: `$${avgPnL.toFixed(2)}` },
  ];

  return (
    <div className="bg-white shadow rounded-xl p-4 animate-fade-in">
      <h3 className="text-xl font-semibold mb-3">Overall Stats</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;
