// /src/components/TotalTrades.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

const TotalTrades = () => {
  const { filteredTrades } = useFilters();

  const totalTrades = filteredTrades.length || 0;

  return (
    <div className="bg-white shadow rounded-xl p-6 animate-fade-in w-full h-36 flex flex-col justify-center items-center border border-gray-200">
      <h3 className="text-xs text-gray-600 mb-3">Total Trades</h3>
      <p className="text-lg font-bold">{totalTrades}</p>
    </div>
  );
};

export default TotalTrades;
