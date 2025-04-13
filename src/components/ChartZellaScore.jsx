import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { motion } from "framer-motion";
import { valueAnimation, RenderTooltip } from "../utils/statUtils.jsx";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend);

const ChartZellaScore = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] flex-1 h-24 flex flex-col justify-center items-center text-gray-500 dark:text-gray-400 text-sm">
        No Zella Score data available
      </div>
    );
  }

  const latest = data[data.length - 1];
  const score = latest?.score ?? 0;

  // Line chart data for Zella Score over time
  const chartData = {
    datasets: [
      {
        label: "Zella Score",
        data: data.map((entry) => ({
          x: new Date(entry.date),
          y: entry.score,
        })),
        borderColor: "#2dd4bf", // Teal to match dashboard palette
        backgroundColor: "rgba(45, 212, 191, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: "#2dd4bf",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "MMM d, yyyy",
          displayFormats: { day: "MMM d" },
        },
        grid: {
          color: "rgba(180, 180, 180, 0.15)",
        },
        ticks: {
          color: "rgba(100, 100, 100, 0.7)",
          font: { size: 11, family: "'Inter', sans-serif" },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(180, 180, 180, 0.15)",
        },
        ticks: {
          color: "rgba(100, 100, 100, 0.7)",
          font: { size: 11, family: "'Inter', sans-serif" },
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#333",
        titleFont: { size: 12, weight: "normal" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => `Score: ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6 rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] flex-1 h-24 flex flex-col justify-between"
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          Zella Score
          <RenderTooltip id="zella-score-tooltip" content="Your overall trading performance score (0-100)." />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <motion.div
          {...valueAnimation}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {score.toFixed(2)}
        </motion.div>
        <div className="w-28 h-8">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
