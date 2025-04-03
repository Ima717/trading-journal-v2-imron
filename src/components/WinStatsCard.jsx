import React from "react";
import { useFilters } from "../context/FilterContext";
import StatCard from "./StatCard";

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

  const daySegments = [
    { color: "bg-green-500", value: stats.green },
    { color: "bg-blue-500", value: stats.blue },
    { color: "bg-red-500", value: stats.red },
  ];

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
  const winWidth = Math.min((avgWin / (avgWin + avgLoss)) * 100, 100);
  const lossWidth = 100 - winWidth;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Day Win % Card */}
      <StatCard
        title="Day Win %"
        value={`${dayWinPercent.toFixed(2)}%`}
        tooltip="Percentage of trading days that ended with net profit."
      >
        <div className="flex flex-col justify-between w-full">
          <div className="flex h-3 w-full rounded overflow-hidden mb-1">
            {daySegments.map(
              (seg, i) =>
                seg.value > 0 && (
                  <div
                    key={i}
                    className={seg.color}
                    style={{ width: `${(seg.value / totalDays) * 100}%` }}
                  />
                )
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
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
        <div className="flex flex-col justify-between w-full">
          <div className="flex h-3 w-full rounded overflow-hidden mb-1">
            <div
              className="bg-green-500 text-xs text-white flex items-center justify-end pr-1"
              style={{ width: `${winWidth}%` }}
            >
              ${avgWin.toFixed(1)}
            </div>
            <div
              className="bg-red-500 text-xs text-white flex items-center justify-start pl-1"
              style={{ width: `${lossWidth}%` }}
            >
              -${avgLoss.toFixed(1)}
            </div>
          </div>
        </div>
      </StatCard>
    </div>
  );
};

export default WinStatsCard;
