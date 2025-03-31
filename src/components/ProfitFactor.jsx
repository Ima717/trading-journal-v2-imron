import React from "react";
import { useFilters } from "../context/FilterContext";

const ProfitFactor = () => {
  const { filteredTrades } = useFilters();
  const grossProfit = filteredTrades
    .filter((t) => t.pnl > 0)
    .reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(
    filteredTrades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0)
  );
  const profitFactor = grossLoss !== 0 ? (grossProfit / grossLoss).toFixed(2) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">Profit Factor</h3>
      <p className={`text-2xl font-bold ${profitFactor >= 1 ? "text-green-600" : "text-red-500"}`}>
        {profitFactor}
      </p>
    </div>
  );
};

export default ProfitFactor;
