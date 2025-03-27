// /src/components/IMAIScore.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

const IMAIScore = () => {
  const { filteredTrades } = useFilters();

  // Calculate Win Rate
  const winRate = filteredTrades.length
    ? (filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length) * 100
    : 0;

  // Calculate Profit Factor
  const grossProfit = filteredTrades
    .filter((t) => t.pnl > 0)
    .reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(
    filteredTrades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0)
  );
  const profitFactor = grossLoss !== 0 ? grossProfit / grossLoss : 0;

  // Calculate Day Win %
  const tradingDays = [...new Set(filteredTrades.map((t) => t.date))];
  const winningDays = tradingDays.filter((day) => {
    const dayTrades = filteredTrades.filter((t) => t.date === day);
    const dayPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    return dayPnL > 0;
  });
  const dayWinPercent = tradingDays.length
    ? (winningDays.length / tradingDays.length) * 100
    : 0;

  // Calculate IMAI Score (weighted average)
  const score = Math.min(
    (winRate * 0.4 + profitFactor * 10 * 0.3 + dayWinPercent * 0.3),
    100
  ).toFixed(2);

  return (
    <div className="bg-white shadow rounded-xl p-4 animate-fade-in w-full h-48 flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">IMAI Score</h3>
      <p className="text-2xl font-bold">{score}</p>
      <div className="w-full h-4 bg-gray-200 rounded mt-2">
        <div
          className="h-full rounded"
          style={{
            width: `${score}%`,
            background: `linear-gradient(to right, #ef4444, #f97316, #22c55e)`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default IMAIScore;
