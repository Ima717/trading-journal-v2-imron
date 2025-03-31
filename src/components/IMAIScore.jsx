import React from "react";
import { useFilters } from "../context/FilterContext";

const IMAIScore = () => {
  const { filteredTrades } = useFilters();
  const winRate = filteredTrades.length
    ? (filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length) * 100
    : 0;
  const grossProfit = filteredTrades
    .filter((t) => t.pnl > 0)
    .reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(
    filteredTrades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0)
  );
  const profitFactor = grossLoss !== 0 ? grossProfit / grossLoss : 0;
  const tradingDays = [...new Set(filteredTrades.map((t) => t.date))];
  const winningDays = tradingDays.filter((day) => {
    const dayTrades = filteredTrades.filter((t) => t.date === day);
    const dayPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    return dayPnL > 0;
  });
  const dayWinPercent = tradingDays.length
    ? (winningDays.length / tradingDays.length) * 100
    : 0;
  const score = Math.min(
    (winRate * 0.4 + profitFactor * 10 * 0.3 + dayWinPercent * 0.3),
    100
  ).toFixed(2);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">IMAI Score</h3>
      <p className="text-2xl font-bold text-blue-600">{score}</p>
    </div>
  );
};

export default IMAIScore;
