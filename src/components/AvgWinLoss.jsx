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
    <div className="bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center">
      <h3 className="text-sm text-gray-600">Avg Win/Loss Trade</h3>
      <div className="flex gap-4 mt-2">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">${avgWin.toFixed(1)}</p>
          <p className="text-xs text-gray-600">Avg Win</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">-${avgLoss.toFixed(1)}</p>
          <p className="text-xs text-gray-600">Avg Loss</p>
        </div>
      </div>
    </div>
  );
};

export default AvgWinLoss;
