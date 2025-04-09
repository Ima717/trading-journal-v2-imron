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
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.15)");
          gradient.addColorStop(1, "rgba(139, 92, 246, 0.5)");
          return gradient;
        },
        borderColor: "transparent",
        borderWidth: 0,
        pointBackgroundColor: "rgba(139, 92, 246, 0.7)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(139, 92, 246, 1)",
        pointRadius: 3,
        pointHoverRadius: 4,
      },
    ],
  };

  // Radar chart options with enhanced styling
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
            const value = context.tick.value;
            const max = 100;
            const opacity = 0.3 + (value / max) * 0.5;
            return `rgba(180, 180, 180, ${opacity})`;
          },
          lineWidth: 2,
        },
        angleLines: {
          color: "rgba(180, 180, 180, 0.6)",
          lineWidth: 2,
        },
        pointLabels: {
          color: "#6b7280",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: "600",
          },
          padding: 25,
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
        tension: 0,
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

  const labelVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center w-[300px] bg-white dark:bg-zinc-800 rounded-xl shadow-lg"
    >
      {/* Radar Chart - No wrapper, dimensions set directly */}
      <Radar data={radarData} options={radarOptions} height={240} width={300} />

      {/* Score Line */}
      <motion.div
        variants={childVariants}
        className="w-full flex flex-col items-center px-4 pb-4"
      >
        <motion.span
          variants={labelVariants}
          className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase"
        >
          Your Zella Score
        </motion.span>

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
        <motion.div
          variants={labelVariants}
          className="relative w-[220px] flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"
        >
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100</span>
        </motion.div>

        <motion.div
          variants={childVariants}
          className="text-2xl font-bold text-zinc-900 dark:text-white"
        >
          {normalizedScore.toFixed(1)}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ChartZellaScore;
