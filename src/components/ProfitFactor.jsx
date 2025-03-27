// /src/components/ProfitFactor.jsx
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
    <div className="bg-white shadow rounded-xl p-4 animate-fade-in w-full h-32 flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">Profit Factor</h3>
      <p className="text-2xl font-bold">{profitFactor}</p>
      <div className="w-16 h-16 relative">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={profitFactor >= 1 ? "#22c55e" : "#ef4444"}
            strokeWidth="4"
            strokeDasharray={`${Math.min(profitFactor * 10, 100)}, 100`}
          />
        </svg>
      </div>
    </div>
  );
};

export default ProfitFactor;
