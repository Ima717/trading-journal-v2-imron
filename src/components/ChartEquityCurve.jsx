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
import { TrendingUp, TrendingDown } from "lucide-react";

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

  // State for dynamic trend indicator
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

  // Chart data with dynamic line color based on trend
  const chartData = {
    labels: data?.map((d) => d.date) || sampleLabels,
    datasets: [
      {
        label: "Net Cumulative P&L",
        data: chartDataPoints,
        fill: true,
        backgroundColor: "rgba(34, 197, 94, 0.2)", // Light green fill
        borderColor: latestTrend === "down" ? "#ef4444" : "#22c55e", // Red for downtrend, green for uptrend
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderColor: latestTrend === "down" ? "#ef4444" : "#22c55e",
        pointBorderWidth: 2,
        borderWidth: 2,
      },
    ],
  };

  // Chart options
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
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280", font: { size: 12, family: "'Inter', sans-serif" } },
      },
      y: {
        grid: { color: "rgba(229, 231, 235, 0.3)", borderDash: [6, 6] },
        ticks: {
          color: "#6b7280",
          callback: (val) => `$${val >= 0 ? val : -val}`,
          font: { size: 12, family: "'Inter', sans-serif" },
          stepSize: Math.max(...chartDataPoints.map(Math.abs), 0) / 4,
        },
        title: { display: true, text: "P&L ($)", color: "#6b7280", font: { size: 14, weight: "bold" } },
      },
    },
    interaction: { mode: "nearest", intersect: false },
    animation: { duration: 1000, easing: "easeInOutQuad" },
  };

  // Trend indicator
  const TrendIndicator = () => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        latestTrend === "up"
          ? "bg-green-100 text-green-700"
          : latestTrend === "down"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700"
      } dark:bg-opacity-50 dark:text-gray-300`}
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
      className="relative w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Equity Curve</h3>
        <TrendIndicator />
      </div>

      {/* Chart Container */}
      <div className="h-[320px]">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

export default ChartEquityCurve;
