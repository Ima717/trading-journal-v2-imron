import React, { useState, useEffect } from "react";
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
import { TrendingUp, TrendingDown } from "lucide-react";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler);

const ChartEquityCurve = ({ data }) => {
  const sampleLabels = ["Mar 15", "Mar 19", "Mar 23", "Mar 27", "Apr 1"];
  const sampleData = [-100, 200, -400, -800, -850];

  const [latestTrend, setLatestTrend] = useState("neutral");
  const [chartDataPoints, setChartDataPoints] = useState(data?.map((d) => d.pnl) || sampleData);

  useEffect(() => {
    const points = data?.map((d) => d.pnl) || sampleData;
    setChartDataPoints(points);

    if (points.length >= 3) {
      const lastThree = points.slice(-3);
      const slope = (lastThree[2] - lastThree[0]) / 2; // Simple slope over last 3 points
      setLatestTrend(slope > 0 ? "up" : slope < 0 ? "down" : "neutral");
    }
  }, [data]);

  // Calculate min and max for y-axis to ensure chart starts from the bottom
  const minValue = Math.min(...chartDataPoints, 0); // Include 0 to ensure visibility of positive/negative range
  const maxValue = Math.max(...chartDataPoints, 0);
  const yAxisMin = minValue < 0 ? minValue : 0; // Start from min if negative, otherwise 0
  const yAxisMax = maxValue > 0 ? maxValue : 0; // End at max if positive, otherwise 0

  const chartData = {
    datasets: [
      {
        label: "Net Cumulative P&L",
        data: (data || sampleData).map((d, i) => ({
          x: data ? new Date(d.date) : sampleLabels[i],
          y: d.pnl,
        })),
        fill: true,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { chartArea, ctx: canvas } = chart;
          if (!chartArea) return "rgba(0,0,0,0)";

          const last = chartDataPoints[chartDataPoints.length - 1];
          const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          if (last > 0) {
            gradient.addColorStop(0, "rgba(34,197,94,0.35)");
            gradient.addColorStop(1, "rgba(34,197,94,0.05)");
          } else if (last < 0) {
            gradient.addColorStop(0, "rgba(239,68,68,0.35)");
            gradient.addColorStop(1, "rgba(239,68,68,0.05)");
          } else {
            gradient.addColorStop(0, "rgba(209,213,219,0.1)");
            gradient.addColorStop(1, "rgba(209,213,219,0.05)");
          }
          return gradient;
        },
        borderColor: "#22c55e",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#22c55e",
        pointBorderWidth: 2,
        borderWidth: 2,
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
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#333",
        titleFont: { size: 14, weight: "600", family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => `P&L: ${context.parsed.y < 0 ? "-$" : "$"}${Math.abs(context.parsed.y).toFixed(2)}`,
        },
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
        grid: { color: "rgba(229, 231, 235, 0.15)" },
        ticks: {
          color: "#6b7280",
          font: { size: 11, family: "'Inter', sans-serif" },
        },
      },
      y: {
        min: yAxisMin, // Start from the minimum value (or 0 if all positive)
        max: yAxisMax, // End at the maximum value (or 0 if all negative)
        grid: {
          color: "rgba(229, 231, 235, 0.15)",
          borderDash: [8, 8],
        },
        ticks: {
          color: "#6b7280",
          callback: (val) => `$${val >= 0 ? val : -val}`,
          font: { size: 13, family: "'Inter', sans-serif" },
        },
      },
    },
    animation: { duration: 800, easing: "easeInOutQuad" },
  };

  const TrendIndicator = () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
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
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="w-full h-full flex flex-col"
    >
      <div className="flex justify-end mb-3">
        <TrendIndicator />
      </div>
      <div className="w-full h-40">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

export default ChartEquityCurve;
