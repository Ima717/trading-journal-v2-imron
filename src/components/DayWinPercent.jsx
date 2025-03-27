// /src/components/DayWinPercent.jsx
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
    <div className="bg-white shadow rounded-xl p-4 animate-fade-in w-full h-36 flex flex-col justify-center items-center">
      <h3 className="text-xs text-gray-600">Day Win %</h3>
      <p className="text-lg font-bold">{dayWinPercent.toFixed(2)}%</p>
      <div className="w-12 h-12 relative">
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
            stroke={dayWinPercent >= 50 ? "#22c55e" : "#ef4444"}
            strokeWidth="4"
            strokeDasharray={`${dayWinPercent}, 100`}
          />
        </svg>
      </div>
    </div>
  );
};

export default DayWinPercent;
