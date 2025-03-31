import React from "react";
import { useFilters } from "../context/FilterContext";

const DayWinPercent = () => {
  const { filteredTrades } = useFilters();
  const tradingDays = [...new Set(filteredTrades.map((t) => t.date))];
  const winningDays = tradingDays.filter((day) => {
    const dayTrades = filteredTrades.filter((t) => t.date === day);
    const dayPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    return dayPnL > 0;
  });
  const dayWinPercent = tradingDays.length
    ? (winningDays.length / tradingDays.length) * 100
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">Day Win %</h3>
      <p className={`text-2xl font-bold ${dayWinPercent >= 50 ? "text-green-600" : "text-red-500"}`}>
        {dayWinPercent.toFixed(2)}%
      </p>
    </div>
  );
};

export default DayWinPercent;
