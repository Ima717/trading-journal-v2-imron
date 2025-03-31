import React from "react";
import { useFilters } from "../context/FilterContext";

const TotalTrades = () => {
  const { filteredTrades } = useFilters();
  const totalTrades = filteredTrades.length || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">Total Trades</h3>
      <p className="text-2xl font-bold text-blue-600">{totalTrades}</p>
    </div>
  );
};

export default TotalTrades;
