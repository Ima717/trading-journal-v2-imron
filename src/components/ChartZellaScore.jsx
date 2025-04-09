import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ChartZellaScore = ({ data }) => {
  if (!data || data.length === 0) return null;

  const latest = data[data.length - 1];
  const score = latest?.score ?? 0;
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  const radarData = {
    labels: [
      "Win %",
      "Profit Factor",
      "Avg Win/Loss",
      "Recovery Factor",
      "Max Drawdown",
      "Consistency",
    ],
    datasets: [
      {
        label: "Zella Metrics",
        data: [70, 60, 55, 40, 45, 65],
        backgroundColor: "rgba(139, 92, 246, 0.3)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(139, 92, 246, 1)",
        pointRadius: 3,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: { display: false },
        grid: {
          color: (ctx) => {
            const value = ctx.tick.value;
            const opacity = 0.2 + (value / 100) * 0.3;
            return `rgba(229, 231, 235, ${opacity})`;
          },
          lineWidth: 1.5,
        },
        angleLines: {
          color: "rgba(229, 231, 235, 0.4)",
          lineWidth: 1.5,
        },
        pointLabels: {
          color: "#6b7280",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: "500",
          },
          padding: 20,
        },
      },
    },
    layout: {
      padding: 0,
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  return (
    <div className="w-[320px] bg-white dark:bg-zinc-800 shadow border border-gray-200 dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center">
      {/* Title */}
      <div className="w-full flex justify-between items-center mb-2">
        <span className="font-semibold text-sm text-gray-800 dark:text-white">Zella score</span>
        <span className="text-gray-400 text-xs cursor-default">ℹ️</span>
      </div>

      {/* Radar Chart */}
      <div className="w-full h-[240px] mb-4 relative">
        <Radar data={radarData} options={radarOptions} />
      </div>

      {/* Score Bar */}
      <div className="w-full border-t border-gray-200 dark:border-zinc-700 pt-3">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Zella Score</div>

        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {normalizedScore.toFixed(2)}
          </div>
          <div className="flex-1 relative h-[6px] bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 rounded-full"
              style={{
                width: `${normalizedScore}%`,
                background: "linear-gradient(to right, #f87171, #facc15, #4ade80)",
              }}
            />
            <div
              className="absolute top-[-4px] h-5 w-5 rounded-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 shadow-md"
              style={{
                left: `${normalizedScore}%`,
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-[2px]">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

export default ChartZellaScore;
