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
      "Profit Factor",
      "Avg Win/Loss",
      "Recovery Factor",
      "Max Drawdown",
      "Consistency",
    ],
    datasets: [
      {
        label: "Zella Metrics",
        data: [70, 60, 55, 40, 45, 65], // Replace with real metrics later
        backgroundColor: "rgba(99, 102, 241, 0.3)",
        borderColor: "rgba(99, 102, 241, 1)",
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
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
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm w-full max-w-[450px] mx-auto"
    >
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-semibold">
        📈 Zella Score
      </h3>

      <div className="relative h-[260px] mb-4">
        <Radar data={radarData} options={radarOptions} />
      </div>

      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Your Zella Score
        </span>
        <div className="relative w-full h-3 bg-gray-200 rounded-full">
          <div
            className="absolute top-0 h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
            style={{ width: "100%" }}
          />
          <div
            className="absolute top-0 h-3 w-1.5 bg-black rounded-full"
            style={{ left: `${score}%` }}
          />
        </div>
        <div className="text-lg font-bold mt-2 text-zinc-800 dark:text-white">
          {score}
        </div>
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
