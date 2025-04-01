import React from "react";
import { useFilters } from "../context/FilterContext";
import { Tooltip } from "react-tooltip";

const DayWinCard = () => {
  const { filteredTrades } = useFilters();

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

  const segments = [
    { color: "bg-green-500", value: stats.green },
    { color: "bg-blue-500", value: stats.blue },
    { color: "bg-red-500", value: stats.red },
  ];

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
          Day Win %
          <span
            data-tooltip-id="daywin-tooltip"
            data-tooltip-content="Percentage of trading days that ended with net profit."
            className="text-gray-400 cursor-pointer"
          >
            ⓘ
          </span>
          <Tooltip
            id="daywin-tooltip"
            className="z-50 text-xs px-2 py-1 rounded shadow-lg bg-gray-900 text-white"
          />
        </div>
        <div className="font-bold text-xl text-zinc-800 dark:text-white">
          {dayWinPercent.toFixed(2)}%
        </div>
      </div>

      <div className="flex h-3 w-full rounded overflow-hidden mb-2">
        {segments.map(
          (seg, i) =>
            seg.value > 0 && (
              <div
                key={i}
                className={`${seg.color}`}
                style={{ width: `${(seg.value / totalDays) * 100}%` }}
              ></div>
            )
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold">
        <span className="text-green-600">{stats.green}</span>
        <span className="text-blue-500">{stats.blue}</span>
        <span className="text-red-500">{stats.red}</span>
      </div>
    </div>
  );
};

export default DayWinCard;
