import React from "react";
import { useFilters } from "../context/FilterContext";

const WinRate = () => {
  const { filteredTrades } = useFilters();
  const winRate = filteredTrades.length
    ? (filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length) * 100
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">Win Rate</h3>
      <p className="text-2xl font-bold text-blue-600">{winRate.toFixed(2)}%</p>
    </div>
  );
};

export default WinRate;
