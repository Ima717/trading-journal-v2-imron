// /src/components/RiskRewardRatio.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

const RiskRewardRatio = () => {
  const { filteredTrades } = useFilters();

  const winningTrades = filteredTrades.filter((t) => t.pnl > 0);
  const losingTrades = filteredTrades.filter((t) => t.pnl < 0);

  const avgWin = winningTrades.length
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
    : 0;

  const riskRewardRatio = avgLoss !== 0 ? (avgWin / avgLoss).toFixed(2) : "N/A";

  return (
    <div className="bg-white shadow rounded-xl p-6 animate-fade-in w-full h-36 flex flex-col justify-center items-center">
      <h3 className="text-xs text-gray-600 mb-3">Risk-Reward Ratio</h3>
      <p className="text-lg font-bold">{riskRewardRatio}</p>
    </div>
  );
};

export default RiskRewardRatio;
