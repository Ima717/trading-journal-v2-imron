import React from "react";
import { useFilters } from "../context/FilterContext";
import StatCard from "./StatCard";
import MiniGauge from "./MiniGauge";

const WinStatsCard = () => {
  const { filteredTrades } = useFilters();

  // --- DAY WIN % LOGIC ---
  const uniqueDays = [...new Set(filteredTrades.map((t) => t.date))];
  const stats = uniqueDays.reduce(
    (acc, date) => {
      const trades = filteredTrades.filter((t) => t.date === date);
      const pnl = trades.reduce((sum, t) => sum + t.pnl, 0);
      if (pnl > 0) acc.green++;
      else if (pnl === 0) acc.blue++;
      else acc.red++;
      return acc;
    },
    { green: 0, blue: 0, red: 0 }
  );

  const totalDays = stats.green + stats.blue + stats.red;
  const dayWinPercent = totalDays ? (stats.green / totalDays) * 100 : 0;

  // --- AVG WIN/LOSS LOGIC ---
  const winningTrades = filteredTrades.filter((t) => t.pnl > 0);
  const losingTrades = filteredTrades.filter((t) => t.pnl < 0);

  const avgWin = winningTrades.length
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
    : 0;

  const avgLoss = losingTrades.length
    ? Math.abs(
        losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length
      )
    : 0;

  const ratio = avgLoss ? avgWin / avgLoss : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Day Win % Card */}
      <StatCard
        title="Day Win %"
        value={`${dayWinPercent.toFixed(2)}%`}
        tooltip="Percentage of trading days that ended with net profit."
      >
        <div className="flex flex-col items-center justify-center w-full mt-2 mb-1">
          <div className="flex justify-center items-center w-full h-[50px]">
            <div className="w-[80px] h-[40px]">
              <MiniGauge
                segments={[
                  { color: "#22c55e", value: stats.green },
                  { color: "#3b82f6", value: stats.blue },
                  { color: "#ef4444", value: stats.red },
                ]}
                radius={35}
                strokeWidth={5}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold w-full mt-1 px-2">
            <span className="text-green-600">{stats.green}</span>
            <span className="text-blue-500">{stats.blue}</span>
            <span className="text-red-500">{stats.red}</span>
          </div>
        </div>
      </StatCard>

      {/* Avg Win/Loss Card */}
      <StatCard
        title="Avg win/loss trade"
        value={ratio.toFixed(2)}
        tooltip="Average dollar value of winning vs losing trades."
      >
        <div className="flex flex-col items-center justify-center w-full mt-2 mb-1">
          <div className="flex justify-center items-center w-full h-[50px]">
            <div className="w-[80px] h-[40px]">
              <MiniGauge
                segments={[
                  { color: "#22c55e", value: avgWin },
                  { color: "#ef4444", value: avgLoss },
                ]}
                radius={35}
                strokeWidth={5}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold w-full mt-1 px-2">
            <span className="text-green-600">${avgWin.toFixed(1)}</span>
            <span className="text-red-500">-${avgLoss.toFixed(1)}</span>
          </div>
        </div>
      </StatCard>
    </div>
  );
};

export default WinStatsCard;
