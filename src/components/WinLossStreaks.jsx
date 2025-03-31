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
    <div className="bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">Win/Loss Streaks</h3>
      <div className="flex gap-4 mt-2">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{longestWinStreak}</p>
          <p className="text-xs text-gray-600">Longest Win</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{longestLossStreak}</p>
          <p className="text-xs text-gray-600">Longest Loss</p>
        </div>
      </div>
    </div>
  );
};

export default WinLossStreaks;
