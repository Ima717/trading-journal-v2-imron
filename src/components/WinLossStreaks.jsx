// /src/components/WinLossStreaks.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

const WinLossStreaks = () => {
  const { filteredTrades } = useFilters();

  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  filteredTrades.forEach((trade) => {
    if (trade.pnl >= 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  });

  return (
    <div className="bg-white shadow rounded-xl p-6 animate-fade-in w-full h-36 flex flex-col justify-center items-center">
      <h3 className="text-xs text-gray-600 mb-3">Win/Loss Streaks</h3>
      <div className="flex gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Longest Win Streak</p>
          <p className="text-lg font-bold text-green-600">{longestWinStreak}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Longest Loss Streak</p>
          <p className="text-lg font-bold text-red-500">{longestLossStreak}</p>
        </div>
      </div>
    </div>
  );
};

export default WinLossStreaks;
