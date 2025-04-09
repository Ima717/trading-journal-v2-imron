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
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.1)");
          gradient.addColorStop(1, "rgba(139, 92, 246, 0.4)");
          return gradient;
        },
        borderColor: "transparent",
        borderWidth: 0,
        pointBackgroundColor: "rgba(139, 92, 246, 0.7)", // Reduced opacity for less visibility
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(139, 92, 246, 1)",
        pointRadius: 3, // Smaller dots
        pointHoverRadius: 4, // Slightly larger on hover
      },
    ],
  };

  // Radar chart options with adjusted positioning and visibility
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
          color: (context) => {
            // Increase visibility with a stronger gradient
            const value = context.tick.value;
            const max = 100;
            const opacity = 0.2 + (value / max) * 0.3; // Gradient from 0.2 to 0.5 opacity
            return `rgba(229, 231, 235, ${opacity})`;
          },
          lineWidth: 1.5, // Slightly thicker lines for better visibility
        },
        angleLines: {
          color: "rgba(229, 231, 235, 0.4)", // Increased opacity for visibility
          lineWidth: 1.5,
        },
        pointLabels: {
          color: "#6b7280",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: "500",
          },
          padding: 20, // Increased padding to prevent label cutoff
        },
      },
    },
    layout: {
      padding: 0,
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
      {/* Radar Chart - Centered with adjusted padding */}
      <div className="w-[300px] h-[240px] flex items-center justify-center">
        <Radar data={radarData} options={radarOptions} />
      </div>

      {/* Score Line */}
      <motion.div
        variants={childVariants}
        className="w-full flex flex-col items-center px-4 pb-4"
      >
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">
          Your Zella Score
        </span>

        <div className="relative w-[220px] h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-1">
          <div
            className="absolute top-0 left-0 h-2 w-full"
            style={{
              background: "linear-gradient(to right, #ff6b6b, #feca57, #48bb78)",
            }}
          />
          <motion.div
            className="absolute top-[-4px] h-4 w-4 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-full"
            initial={{ left: "0%", opacity: 0 }}
            animate={{
              left: `${normalizedScore}%`,
              opacity: 1,
              transform: "translateX(-50%)",
            }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </div>

        {/* Score markers */}
        <div className="relative w-[220px] flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100</span>
        </div>

        <motion.div
          className="text-2xl font-bold text-zinc-900 dark:text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {normalizedScore.toFixed(1)}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ChartZellaScore;
