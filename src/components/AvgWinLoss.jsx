// /src/components/AvgWinLoss.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

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

  return (
    <div className="bg-white shadow rounded-xl p-4 animate-fade-in w-full h-36 flex flex-col justify-center items-center">
      <h3 className="text-xs text-gray-600">Avg Win/Loss Trade</h3>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center">
          <div className="w-20 h-3 bg-gray-200 rounded">
            <div
              className="h-full bg-green-500 rounded"
              style={{ width: `${Math.min((avgWin / (avgWin + avgLoss)) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="ml-2 text-xs text-green-600">${avgWin.toFixed(1)}</p>
        </div>
        <div className="flex items-center">
          <div className="w-20 h-3 bg-gray-200 rounded">
            <div
              className="h-full bg-red-500 rounded"
              style={{ width: `${Math.min((avgLoss / (avgWin + avgLoss)) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="ml-2 text-xs text-red-500">-${avgLoss.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};

export default AvgWinLoss;
