import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
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
      "Consistency"
    ],
    datasets: [
      {
        label: "Zella Metrics",
        data: [70, 60, 55, 40, 45, 65], // Placeholder — replace with real data
        backgroundColor: "rgba(99, 102, 241, 0.25)",
        borderColor: "#6366f1",
        pointBackgroundColor: "#6366f1",
        borderWidth: 2
      }
    ]
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
          font: { size: 11 }
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm w-full flex flex-col md:flex-row items-center justify-between gap-6"
    >
      {/* Left: Radar Chart */}
      <div className="w-full md:w-2/3 h-64">
        <Radar data={radarData} options={radarOptions} />
      </div>

      {/* Right: Score Display */}
      <div className="w-full md:w-1/3 flex flex-col items-center">
        <div className="relative w-24 h-24 mb-2">
          <svg className="w-full h-full">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="48"
              cx="60"
              cy="60"
            />
            <circle
              className="text-purple-500"
              strokeWidth="8"
              strokeDasharray="301.59"
              strokeDashoffset={301.59 - (score / 100) * 301.59}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="48"
              cx="60"
              cy="60"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-zinc-800 dark:text-white">
              {score}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          Zella Score <br className="md:hidden" /> (max 100)
        </p>
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
