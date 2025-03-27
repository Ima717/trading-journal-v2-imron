// /src/components/ProgressTracker.jsx
import React from "react";
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { useFilters } from "../context/FilterContext";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ProgressTracker = () => {
  const { filteredTrades } = useFilters();

  const winRate = filteredTrades.length
    ? (filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length) * 100
    : 0;

  const grossProfit = filteredTrades
    .filter((t) => t.pnl > 0)
    .reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(
    filteredTrades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0)
  );
  const profitFactor = grossLoss !== 0 ? Math.min(grossProfit / grossLoss, 5) : 0;

  const tradingDays = [...new Set(filteredTrades.map((t) => t.date))];
  const winningDays = tradingDays.filter((day) => {
    const dayTrades = filteredTrades.filter((t) => t.date === day);
    const dayPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    return dayPnL > 0;
  });
  const consistency = tradingDays.length
    ? (winningDays.length / tradingDays.length) * 100
    : 0;

  const maxDrawdown = Math.min(
    ...filteredTrades.reduce((acc, t, i) => {
      const runningPnL = filteredTrades.slice(0, i + 1).reduce((sum, trade) => sum + trade.pnl, 0);
      return [...acc, runningPnL];
    }, [0])
  );
  const maxDrawdownPercent = Math.abs(maxDrawdown / 1000) * 100;

  const avgWin = filteredTrades.filter((t) => t.pnl > 0).length
    ? filteredTrades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) /
      filteredTrades.filter((t) => t.pnl > 0).length
    : 0;
  const avgLoss = filteredTrades.filter((t) => t.pnl < 0).length
    ? Math.abs(
        filteredTrades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) /
          filteredTrades.filter((t) => t.pnl < 0).length
      )
    : 0;
  const avgWinLoss = avgLoss !== 0 ? avgWin / avgLoss : 0;

  const data = {
    labels: ["Win %", "Consistency", "Profit Factor", "Max Drawdown", "Avg Win/Loss"],
    datasets: [
      {
        label: "Progress",
        data: [
          winRate / 100,
          consistency / 100,
          profitFactor / 5,
          (100 - maxDrawdownPercent) / 100,
          Math.min(avgWinLoss / 5, 1),
        ],
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 1,
        ticks: { stepSize: 0.2 },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="bg-white shadow rounded-xl p-4 animate-fade-in w-full h-44 flex flex-col justify-center items-center">
      <h3 className="text-xs text-gray-600 mb-2">Progress Tracker</h3>
      <div className="w-full h-28">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};

export default ProgressTracker;
