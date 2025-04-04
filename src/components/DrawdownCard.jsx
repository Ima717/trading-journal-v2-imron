import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
);

const DrawdownCard = ({ maxDrawdown = -905, recoveryFactor = 0.38, data = [] }) => {
  const chartRef = useRef(null);

  const drawdownAbs = Math.abs(maxDrawdown);
  const maxRange = 1000;
  const percent = Math.min((drawdownAbs / maxRange) * 100, 100);

  const labels = data.map((d) => d.date);
  const pnlPoints = data.map((d) => d.pnl);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cumulative P&L",
        data: pnlPoints,
        tension: 0,
        pointRadius: 0,
        fill: true,
        borderWidth: 2,
        borderColor: "#10b981",
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { chartArea, ctx: canvas } = chart;
          if (!chartArea) return "rgba(0,0,0,0)";

          const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(34,197,94,0.35)");
          gradient.addColorStop(0.5, "rgba(255,255,255,0)");
          gradient.addColorStop(0.5, "rgba(255,255,255,0)");
          gradient.addColorStop(1, "rgba(239,68,68,0.35)");
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#f9fafb",
        bodyColor: "#f9fafb",
        padding: 8,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            return `P&L: ${val < 0 ? "-$" : "$"}${Math.abs(val).toLocaleString()}`;
          },
          title: () => null,
        },
      },
    },
    scales: {
      x: {
        display: false, // ⛔ Hide x-axis
      },
      y: {
        ticks: {
          color: "#6b7280",
          font: { size: 11, family: "'Inter', sans-serif" },
          callback: (val) => `$${val}`,
        },
        grid: {
          color: "rgba(229,231,235,0.15)",
          borderDash: [6, 6],
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full flex flex-col"
    >
      {/* Title and Max DD */}
      <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-white">
          Max Drawdown
        </h3>
        <span className="text-sm text-red-600 font-semibold flex items-center gap-1">
          <ArrowDown size={14} /> ${drawdownAbs.toFixed(2)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-zinc-700 relative overflow-hidden mb-2">
        <div
          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Recovery Factor */}
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="text-gray-500 dark:text-gray-400">Recovery Factor</span>
        <span
          className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
            recoveryFactor > 1
              ? "bg-green-100 text-green-700"
              : recoveryFactor > 0.5
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {recoveryFactor.toFixed(2)}
        </span>
      </div>

      {/* Chart */}
      <div className="flex-grow -mx-4 px-4">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

export default DrawdownCard;
