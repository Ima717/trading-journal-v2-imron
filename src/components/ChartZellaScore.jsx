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
        data: [70, 60, 55, 40, 45, 65], // TODO: Replace with real metrics
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
      className="flex flex-col items-center space-y-6 w-full"
    >
      {/* Radar Chart */}
      <div className="w-full max-w-[300px] h-[240px]">
        <Radar data={radarData} options={radarOptions} />
      </div>

      {/* Score Line */}
      <div className="w-full flex flex-col items-center px-4">
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Your Zella Score
        </span>

        <div className="relative w-full max-w-[220px] h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
          <div
            className="absolute top-0 left-0 h-2 w-full"
            style={{
              background: "linear-gradient(to right, #1565c0, #b92b27)",
            }}
          />
          <div
            className="absolute top-[-4px] h-4 w-4 bg-white border-2 border-black rounded-full"
            style={{
              left: `${score}%`,
              transform: "translateX(-50%)",
            }}
          />
        </div>

        <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
          {score}
        </div>
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
