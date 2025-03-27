// /src/components/AvgPnL.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

const AvgPnL = () => {
  const { filteredTrades } = useFilters();

  const avgPnL = filteredTrades.length
    ? filteredTrades.reduce((sum, t) => sum + Number(t.pnl), 0) / filteredTrades.length
    : 0;

  return (
    <div className="bg-white shadow rounded-xl p-6 animate-fade-in w-full h-36 flex flex-col justify-center items-center border border-gray-200">
      <h3 className="text-xs text-gray-600 mb-3">Avg PnL</h3>
      <p className={`text-lg font-bold ${avgPnL >= 0 ? "text-green-600" : "text-red-500"}`}>
        ${avgPnL.toFixed(2)}
      </p>
    </div>
  );
};

export default AvgPnL;
