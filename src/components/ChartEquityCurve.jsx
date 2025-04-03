// ChartEquityCurve.jsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react"; // Adding icons for visual flair

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const ChartEquityCurve = ({ data }) => {
  // Sample fallback data
  const sampleLabels = ["Mar 15", "Mar 17", "Mar 19", "Mar 21", "Mar 23", "Mar 25", "Mar 27", "Mar 29", "Apr 1"];
  const sampleData = [-100, 50, 200, -150, -400, -600, -800, -900, -850];

  // State for dynamic tooltip and trend indicator
  const [latestTrend, setLatestTrend] = useState("neutral");
  const [chartDataPoints, setChartDataPoints] = useState(data?.map((d) => d.pnl) || sampleData);

  useEffect(() => {
    const points = data?.map((d) => d.pnl) || sampleData;
    setChartDataPoints(points);

    // Determine trend based on last two data points
    if (points.length >= 2) {
      const lastValue = points[points.length - 1];
      const secondLastValue = points[points.length - 2];
      if (lastValue > secondLastValue) setLatestTrend("up");
      else if (lastValue < secondLastValue) setLatestTrend("down");
      else setLatestTrend("neutral");
    }
  }, [data]);

  // Enhanced chart data with gradient fill
  const chartData = {
    labels: data?.map((d) => d.date) || sampleLabels,
    datasets: [
      {
        label: "Net Cumulative P&L",
        data: chartDataPoints,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.3)"); // Green gradient start
          gradient.addColorStop(1, "rgba(34, 197, 94, 0.05)"); // Fade to transparent
          return gradient;
        },
        borderColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, "#22c55e"); // Green line
          gradient.addColorStop(1, "#16a34a"); // Slightly darker green
          return gradient;
        },
        tension: 0.4, // Smoother curve
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#22c55e",
        pointBorderWidth: 2,
        borderWidth: 3,
      },
    ],
  };

  // Enhanced chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        titleFont: { size: 14, weight: "bold", family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `P&L: $${context.parsed.y.toFixed(2)}`,
          title: (tooltipItems) => tooltipItems[0].label,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#9ca3af", // Gray-400 for better contrast
          maxTicksLimit: 8,
          font: { size: 12, family: "'Inter', sans-serif" },
        },
      },
      y: {
        grid: {
          color: "rgba(229, 231, 235, 0.3)", // Subtle grid lines
          borderDash: [5, 5], // Dashed grid for modern look
        },
        ticks: {
          color: "#9ca3af",
          callback: (val) => `$${val}`,
          font: { size: 12, family: "'Inter', sans-serif" },
          stepSize: Math.max(...chartDataPoints, 0) / 4, // Dynamic step size
        },
        title: {
          display: true,
          text: "P&L ($)",
          color: "#6b7280",
          font: { size: 14, weight: "bold", family: "'Inter', sans-serif" },
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
      axis: "x",
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
  };

  // Trend indicator component
  const TrendIndicator = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
        latestTrend === "up"
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : latestTrend === "down"
          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
      }`}
    >
      {latestTrend === "up" ? (
        <TrendingUp size={16} />
      ) : latestTrend === "down" ? (
        <TrendingDown size={16} />
      ) : (
        <span>—</span>
      )}
      <span>{latestTrend === "up" ? "Uptrend" : latestTrend === "down" ? "Downtrend" : "Neutral"}</span>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg w-full overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #ffffff, #f9fafb)", // Subtle gradient for light mode
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.03)", // Layered shadow
      }}
    >
      {/* Header with Trend Indicator */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span className="text-green-500">📈</span> Equity Curve
        </h3>
        <TrendIndicator />
      </div>

      {/* Chart Container */}
      <div className="relative h-[300px] p-2 rounded-lg bg-gray-50 dark:bg-zinc-900">
        <Line data={chartData} options={options} />
        {/* Subtle overlay gradient for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent 50%)",
          }}
        />
      </div>

      {/* Hover Effect Overlay */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.05 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "linear-gradient(145deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))",
        }}
      />
    </motion.div>
  );
};

export default ChartEquityCurve;
