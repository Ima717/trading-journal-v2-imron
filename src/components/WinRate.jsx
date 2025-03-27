// /src/components/WinRate.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

const WinRate = () => {
  const { filteredTrades } = useFilters();

  const winRate = filteredTrades.length
    ? (filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length) * 100
    : 0;

  return (
    <div className="bg-white shadow rounded-xl p-6 animate-fade-in w-full h-36 flex flex-col justify-center items-center border border-gray-200">
      <h3 className="text-xs text-gray-600 mb-3">Win Rate</h3>
      <p className="text-lg font-bold">{winRate.toFixed(2)}%</p>
    </div>
  );
};

export default WinRate;
