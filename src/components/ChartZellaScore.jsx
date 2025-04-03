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
        data: [70, 60, 55, 40, 45, 65], // Replace with dynamic values later
        backgroundColor: "rgba(139, 92, 246, 0.3)",
        borderColor: "rgba(139, 92, 246, 1)",
        pointBackgroundColor: "rgba(139, 92, 246, 1)",
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false },
        grid: { color: "#e5e7eb" },
        pointLabels: {
          color: "#6b7280",
          font: { size: 12 },
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
      <h3 className="text-sm text-gray-600 dark:text-gray-300 font-semibold mb-4">
        Zella Score
      </h3>

      {/* Radar + Gauge Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="w-full md:w-1/2">
          <Radar data={radarData} options={radarOptions} />
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Your Zella Score
          </span>
          <div className="relative w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-2">
            <div
              className="absolute top-0 h-2 rounded-full"
              style={{
                width: "100%",
                background:
                  "linear-gradient(to right, #020024, #090979, #00d4ff)",
              }}
            />
            <div
              className="absolute top-0 h-2 w-2 bg-white border-2 border-black rounded-full"
              style={{ left: `${score}%`, transform: "translateX(-50%)" }}
            />
          </div>
          <div className="text-2xl font-bold text-zinc-800 dark:text-white">
            {score}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
