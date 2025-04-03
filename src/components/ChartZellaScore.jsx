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
        backgroundColor: "rgba(139, 92, 246, 0.3)",
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
      {/* Title */}
      <h3 className="text-sm text-gray-600 dark:text-gray-300 font-semibold mb-3">
        Zella Score
      </h3>

      {/* Radar Chart - smaller */}
      <div className="w-full flex justify-center mb-5">
        <div className="w-full max-w-[300px] h-[250px]">
          <Radar data={radarData} options={radarOptions} />
        </div>
      </div>

      {/* Score Line - gradient + indicator */}
      <div className="flex flex-col items-center w-full">
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Your Zella Score
        </span>

        <div className="relative w-[80%] h-2 rounded-full bg-gray-200 overflow-hidden mb-1">
          <div
            className="absolute top-0 h-2 w-full rounded-full"
            style={{
              background: "linear-gradient(to right, #1565c0, #b92b27)",
            }}
          />
          <div
            className="absolute top-0 h-2 w-2 bg-white border-2 border-black rounded-full"
            style={{
              left: `${score}%`,
              transform: "translateX(-50%)",
            }}
          />
        </div>

        <div className="text-lg font-bold text-zinc-800 dark:text-white">
          {score}
        </div>
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
