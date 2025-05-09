import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Info } from "lucide-react"; // Added Info icon
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
import { RenderTooltip } from "../utils/statUtils.jsx"; // Imported RenderTooltip

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler);

const DrawdownCard = ({ maxDrawdown = 0, recoveryFactor = 0, data = [] }) => {
  const drawdownAbs = Math.abs(maxDrawdown);
  const maxRange = Math.max(drawdownAbs * 1.2, 1000); // Dynamic range
  const percent = Math.min((drawdownAbs / maxRange) * 100, 100);

  // Calculate min and max for the y-axis based on data
  const minValue = Math.min(...data.map((d) => d.pnl));
  const maxValue = Math.max(...data.map((d) => d.pnl));
  const padding = Math.abs(maxValue - minValue) * 0.1; // 10% padding for better visualization
  const yMin = minValue - padding;
  const yMax = maxValue + padding;

  // Prepare sparkline data from cumulative P&L (data prop)
  const chartData = {
    datasets: [
      {
        label: "Cumulative P&L",
        data: data.map((d) => ({
          x: new Date(d.date),
          y: d.pnl,
        })),
        borderColor: "rgba(239, 68, 68, 0.8)", // Red to match drawdown theme
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { chartArea, ctx: canvas } = chart;
          if (!chartArea) return "rgba(0,0,0,0)";

          const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.2)");
          gradient.addColorStop(1, "rgba(239, 68, 68, 0.05)");
          return gradient;
        },
        fill: true,
        tension: 0.3,
        pointRadius: 0, // No points for a cleaner look
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0,
        right: 0,
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
          display: false,
        },
        ticks: {
          display: false, // Hide x-axis ticks
        },
      },
      y: {
        min: yMin, // Start from the minimum data value
        max: yMax, // Extend to the maximum data value
        beginAtZero: false, // Prevent Chart.js from forcing y=0 into the range
        grid: {
          display: false,
        },
        ticks: {
          display: false, // Hide y-axis ticks
        },
        afterFit: (scale) => {
          scale.paddingBottom = 0; // Remove padding at the bottom
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
          label: (context) => `P&L: ${context.parsed.y < 0 ? "-$" : "$"}${Math.abs(context.parsed.y).toFixed(2)}`,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full relative"
    >
      {/* Title and Max Drawdown with Tooltip */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-white">
            Max Drawdown
          </h3>
          <RenderTooltip
            id="max-drawdown-tooltip"
            content="Max Drawdown shows the largest percentage decline in your account from a peak to a trough. It helps you assess the worst-case risk of your trading strategy and adjust to minimize future losses."
          />
        </div>
        <span className="text-sm text-red-600 font-semibold flex items-center gap-1">
          <ArrowDown size={14} /> {drawdownAbs.toFixed(2)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-zinc-700 relative overflow-hidden mb-3">
        <div
          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Recovery Factor */}
      <div className="flex justify-between items-center text-sm mb-3">
        <span className="text-gray-500 dark:text-gray-400">Recovery Factor</span>
        <span
          className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
            recoveryFactor > 1
              ? "bg-green-100 text-green-700"
              : recoveryFactor > 0.5
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          } dark:bg-opacity-50 dark:text-gray-300`}
        >
          {recoveryFactor.toFixed(2)}
        </span>
      </div>

      {/* Sparkline Chart, positioned at the bottom with pixel height */}
      <div className="absolute bottom-0 left-0 right-0 h-[120px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </motion.div>
  );
};

export default DrawdownCard;
