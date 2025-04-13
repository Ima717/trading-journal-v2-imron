import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { motion } from "framer-motion";
import { valueAnimation, RenderTooltip } from "../utils/statUtils.jsx";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler);

const ChartZellaScore = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] flex-1 h-24 flex flex-col justify-center items-center text-gray-500 dark:text-gray-400 text-sm">
        No Zella Score data available
      </div>
    );
  }

  const latest = data[data.length - 1];
  const score = latest?.score ?? 0;

  // Determine background color based on score
  const getScoreBackground = () => {
    if (score > 60) return "bg-green-100 text-green-700";
    if (score >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: "Zella Score",
          data: data.map((entry) => ({
            x: new Date(entry.date),
            y: entry.score,
          })),
          borderColor: "#2dd4bf", // Teal to match dashboard palette
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { chartArea, ctx: canvas } = chart;
            if (!chartArea) return "rgba(0,0,0,0)";

            const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(45, 212, 191, 0.35)");
            gradient.addColorStop(1, "rgba(45, 212, 191, 0.05)");
            return gradient;
          },
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5, // Slight hover effect for interactivity
          pointBackgroundColor: "#2dd4bf",
          borderWidth: 2,
        },
      ],
    }),
    [data]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0, // Minimize internal left padding
        right: 0, // Minimize internal right padding
        top: 0,
        bottom: 0,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "MMM d, yyyy",
          displayFormats: { day: "MMM d" },
        },
        grid: {
          display: false, // Hide grid lines for cleaner look
        },
        ticks: {
          display: false, // Hide x-axis ticks to save space
        },
      },
      y: {
        min: 0, // Start from 0
        max: 100, // Max at 100
        grid: {
          display: false, // Hide grid lines
        },
        ticks: {
          display: false, // Hide y-axis ticks to save space
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
      className="relative rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] flex-1 pt-6 pb-2 px-0"
    >
      {/* Score aligned with title height in top-right corner */}
      <motion.div
        {...valueAnimation}
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground()} dark:bg-opacity-50 dark:text-gray-300`}
      >
        {score.toFixed(2)}
      </motion.div>

      {/* Chart at the bottom, full width and height */}
      <Line data={chartData} options={chartOptions} height={60} />
    </motion.div>
  );
};

export default ChartZellaScore;
