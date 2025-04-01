import React from "react";
import { useFilters } from "../context/FilterContext";
import { Tooltip } from "react-tooltip";

const AvgWinLoss = () => {
  const { filteredTrades } = useFilters();
  const winningTrades = filteredTrades.filter((t) => t.pnl > 0);
  const losingTrades = filteredTrades.filter((t) => t.pnl < 0);

  const avgWin = winningTrades.length
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
    : 0;

  const avgLoss = losingTrades.length
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
    : 0;

  const ratio = avgLoss ? avgWin / avgLoss : 0;
  const winWidth = Math.min((avgWin / (avgWin + avgLoss)) * 100, 100);
  const lossWidth = 100 - winWidth;

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
          Avg win/loss trade
          <span
            data-tooltip-id="avgwl-tooltip"
            data-tooltip-content="Average dollar value of winning vs losing trades"
            className="text-gray-400 cursor-pointer"
          >
            ⓘ
          </span>
          <Tooltip
            id="avgwl-tooltip"
            className="z-50 text-xs px-2 py-1 rounded shadow-lg bg-gray-900 text-white"
          />
        </div>
        <div className="font-bold text-xl text-zinc-800 dark:text-white">
          {ratio.toFixed(2)}
        </div>
      </div>

      <div className="flex h-3 w-full rounded overflow-hidden mb-2">
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
  );
};

export default AvgWinLoss;
