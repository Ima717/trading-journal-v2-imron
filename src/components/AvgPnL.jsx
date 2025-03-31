import React from "react";
import { useFilters } from "../context/FilterContext";

const AvgPnL = () => {
  const { filteredTrades } = useFilters();
  const avgPnL = filteredTrades.length
    ? filteredTrades.reduce((sum, t) => sum + Number(t.pnl), 0) / filteredTrades.length
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">Avg P&L</h3>
      <p className={`text-2xl font-bold ${avgPnL >= 0 ? "text-green-600" : "text-red-500"}`}>
        ${avgPnL.toFixed(2)}
      </p>
    </div>
  );
};

export default AvgPnL;
