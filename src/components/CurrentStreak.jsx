// /src/components/CurrentStreak.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

const CurrentStreak = () => {
  const { filteredTrades } = useFilters();

  const tradingDays = [...new Set(filteredTrades.map((t) => t.date))].sort();
  let dayStreak = 0;
  for (let i = tradingDays.length - 1; i >= 0; i--) {
    const dayTrades = filteredTrades.filter((t) => t.date === tradingDays[i]);
    const dayPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    if (dayPnL <= 0) break;
    dayStreak++;
  }

  let tradeStreak = 0;
  for (let i = filteredTrades.length - 1; i >= 0; i--) {
    if (filteredTrades[i].pnl <= 0) break;
    tradeStreak++;
  }

  return (
    <div className="bg-white shadow rounded-xl p-4 animate-fade-in w-full h-44 flex flex-col justify-center items-center">
      <h3 className="text-xs text-gray-600">Current Streak</h3>
      <div className="flex gap-4 mt-2">
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">{dayStreak}</p>
          <p className="text-xs text-gray-600">Winning Days</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">{tradeStreak}</p>
          <p className="text-xs text-gray-600">Winning Trades</p>
        </div>
      </div>
    </div>
  );
};

export default CurrentStreak;
