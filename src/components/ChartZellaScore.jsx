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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const ChartZellaScore = ({ data }) => {
  if (!data || data.length === 0) return null;

  const latest = data[data.length - 1];
  const score = latest?.score ?? 0;

  const radarData = {
    labels: [
      "Win %",
      "Profit factor",
      "Avg win/loss",
      "Recovery factor",
      "Max drawdown",
      "Consistency",
    ],
    datasets: [
      {
        label: "Zella Metrics",
        data: [70, 60, 55, 40, 45, 65], // Replace with real metrics
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderColor: "rgba(139, 92, 246, 1)",
        pointBackgroundColor: "rgba(139, 92, 246, 1)",
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false },
        grid: { color: "#e5e7eb" },
        pointLabels: {
          color: "#6b7280",
          font: { size: 11 },
        },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm"
    >
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-semibold">
        📈 Zella Score
      </h3>

      <div className="h-64 flex flex-col justify-between">
        <div className="flex-1 relative mb-2">
          <Radar data={radarData} options={radarOptions} />
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">Your Zella Score</span>
            <span className="text-lg font-bold text-zinc-800 dark:text-white">{score}</span>
          </div>

          <div className="relative h-2 rounded-full bg-gray-200 dark:bg-zinc-700">
            <div className="absolute h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" />
            <div
              className="absolute h-4 w-4 rounded-full bg-white border-2 border-gray-800 shadow-sm -top-1"
              style={{ left: `${score}%`, transform: "translateX(-50%)" }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
