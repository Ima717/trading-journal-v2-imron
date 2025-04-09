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

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ChartZellaScore = ({ data }) => {
  // Handle empty or invalid data
  if (!data || data.length === 0) return null;

  const latest = data[data.length - 1];
  const score = latest?.score ?? 0;

  // Normalize the score to ensure it's between 0 and 100
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  // Radar chart data with real metrics
  const radarData = {
    labels: ["Win %", "Profit Factor", "Avg Win/Loss", "Recovery Factor", "Max Drawdown", "Consistency"],
    datasets: [
      {
        label: "Zella Metrics",
        data: [70, 60, 55, 40, 45, 65], // Replace with real metrics from data prop
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.2)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 0.4)");
          return gradient;
        },
        borderColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.8)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 0.8)");
          return gradient;
        },
        borderWidth: 3,
        pointBackgroundColor: "rgba(139, 92, 246, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(139, 92, 246, 1)",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Radar chart options with precise positioning
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutCubic",
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: { display: false },
        grid: {
          color: "rgba(229, 231, 235, 0.3)",
          lineWidth: 1,
        },
        angleLines: {
          color: "rgba(229, 231, 235, 0.3)",
        },
        pointLabels: {
          color: "#6b7280",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: "500",
          },
          padding: 10, // Fine-tuned for centering
        },
      },
    },
    layout: {
      padding: 0, // No padding to eliminate gaps
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 12, family: "'Inter', sans-serif" },
        bodyFont: { size: 11, family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 8,
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderCapStyle: "round",
        borderJoinStyle: "round",
      },
    },
  };

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center w-[300px] bg-white dark:bg-zinc-800 rounded-xl shadow-lg"
    >
      {/* Radar Chart - Precise size with no gaps */}
      <div className="w-[300px] h-[240px] flex items-center justify-center">
        <Radar data={radarData} options={radarOptions} />
        {/* Overlay for subtle glow effect */}
        <div className="absolute w-[300px] h-[240px] bg-gradient-to-b from-transparent to-white/5 dark:to-zinc-700/5 pointer-events-none" />
      </div>

      {/* Score Line - Tight spacing */}
      <motion.div
        variants={childVariants}
        className="w-full flex flex-col items-center px-4 pb-4"
      >
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Your Zella Score
        </span>

        <div className="relative w-[220px] h-3 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-1">
          <motion.div
            className="absolute top-0 left-0 h-3"
            initial={{ width: 0 }}
            animate={{ width: `${normalizedScore}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background: "linear-gradient(to right, #ff6b6b, #feca57, #48bb78)",
            }}
          />
          <motion.div
            className="absolute top-[-6px] h-6 w-6 bg-white dark:bg-zinc-900 border-2 border-white dark:border-zinc-900 rounded-full shadow-lg"
            initial={{ left: "0%", opacity: 0 }}
            animate={{
              left: `${normalizedScore}%`,
              opacity: 1,
              transform: "translateX(-50%)",
            }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            style={{
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)",
            }}
          />
        </div>

        <motion.div
          className="text-2xl font-bold text-zinc-900 dark:text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {normalizedScore}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ChartZellaScore;
