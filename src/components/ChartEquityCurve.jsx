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
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react"; // Icons for trend indicator

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
  const sampleLabels = ["Mar 15", "Mar 19", "Mar 23", "Mar 27", "Apr 1"];
  const sampleData = [-100, 200, -400, -800, -850];

  // State for dynamic tooltip and trend indicator
  const [latestTrend, setLatestTrend] = useState("neutral");
  const [chartDataPoints, setChartDataPoints] = useState(data?.map((d) => d.pnl) || sampleData);

  useEffect(() => {
    const points = data?.map((d) => d.pnl) || sampleData;
    setChartDataPoints(points);

    if (points.length >= 2) {
      const lastValue = points[points.length - 1];
      const secondLastValue = points[points.length - 2];
      setLatestTrend(lastValue > secondLastValue ? "up" : lastValue < secondLastValue ? "down" : "neutral");
    }
  }, [data]);

  // Enhanced chart data with gradient and animation
  const chartData = {
    labels: data?.map((d) => d.date) || sampleLabels,
    datasets: [
      {
        label: "Net Cumulative P&L",
        data: chartDataPoints,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.15)"); // Light green fade
          gradient.addColorStop(1, "rgba(34, 197, 94, 0.02)"); // Near-transparent end
          return gradient;
        },
        borderColor: "#22c55e", // Solid green line
        tension: 0.4,
        pointRadius: 0, // Dynamic points handled below
        pointHoverRadius: 0,
        borderWidth: 2.5,
      },
    ],
  };

  // Custom plugin for animated data points
  const pointPlugin = {
    id: "customPoints",
    afterDatasetsDraw: (chart) => {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((element, index) => {
          ctx.beginPath();
          ctx.arc(element.x, element.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = chart.data.datasets[i].borderColor;
          ctx.fill();
          ctx.closePath();
        });
      });
    },
  };

  // Enhanced chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleFont: { size: 14, weight: "bold", family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (context) => `P&L: $${context.parsed.y.toFixed(2)}`,
          title: (tooltipItems) => tooltipItems[0].label,
        },
      },
      customPoints: pointPlugin, // Custom plugin for animated points
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", font: { size: 12, family: "'Inter', sans-serif" } },
      },
      y: {
        grid: { color: "rgba(229, 231, 235, 0.2)", borderDash: [6, 6] },
        ticks: {
          color: "#9ca3af",
          callback: (val) => `$${val}`,
          font: { size: 12, family: "'Inter', sans-serif" },
          stepSize: Math.max(...chartDataPoints, 0) / 4,
        },
        title: { display: true, text: "P&L ($)", color: "#6b7280", font: { size: 14, weight: "bold" } },
      },
    },
    interaction: { mode: "nearest", intersect: false },
    hover: { mode: "nearest", intersect: true },
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
  };

  // Trend indicator with animation
  const TrendIndicator = () => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        latestTrend === "up"
          ? "bg-green-100/80 text-green-700 dark:bg-green-900/80 dark:text-green-300"
          : latestTrend === "down"
          ? "bg-red-100/80 text-red-700 dark:bg-red-900/80 dark:text-red-300"
          : "bg-gray-100/80 text-gray-700 dark:bg-gray-700/80 dark:text-gray-300"
      } backdrop-blur-sm`}
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
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-800/50"
      style={{
        background: "linear-gradient(135deg, #ffffff, #f0f4f8)", // Glassmorphism-inspired gradient
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)", // Enhanced shadow
        backdropFilter: "blur(8px)", // Glassmorphism effect
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200/30 dark:border-gray-800/30">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span role="img" aria-label="chart">📈</span> Equity Curve
        </h3>
        <TrendIndicator />
      </div>

      {/* Chart Container */}
      <div className="relative h-[320px] p-4">
        <Line data={chartData} options={options} plugins={[pointPlugin]} />
        {/* Animated point highlight on hover */}
        <AnimatePresence>
          {options.interaction.mode === "nearest" && (
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-green-500"
              style={{ left: 0, top: 0, pointerEvents: "none" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.8 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
        {/* Subtle overlay for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(255, 255, 255, 0.2), transparent)",
          }}
        />
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))",
        }}
      />
    </motion.div>
  );
};

export default ChartEquityCurve;
