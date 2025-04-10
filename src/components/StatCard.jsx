import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";
import { Info, BarChart3 } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip);

const StatCard = ({
  title,
  value,
  color = "text-gray-900 dark:text-white",
  tooltip,
  badge,
  customBg = "",
  children,
  trades, // Added to receive trade data
}) => {
  const tooltipId = `tooltip-${title}`;
  const badgeId = `badge-${title}`;
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayValue(value);
    }, 50);
    return () => clearTimeout(timeout);
  }, [value]);

  // Calculate total profit and loss for donut chart
  const totalProfit = trades
    ? trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    : 0;
  const totalLoss = trades
    ? Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    : 0;

  // Donut chart data
  const chartData = {
    labels: ["Total Profit", "Total Loss"],
    datasets: [
      {
        data: [totalProfit || 1, totalLoss || 1], // Fallback to avoid empty chart
        backgroundColor: ["#22c55e", "#ef4444"], // Green for profit, red for loss
        borderWidth: 0,
        cutout: "65%", // Donut thickness
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // No legend to keep it compact
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) =>
            `${context.label}: $${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div
      className={`relative p-6 rounded-xl shadow-sm w-full flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200 group overflow-hidden ${
        customBg || "bg-white dark:bg-zinc-800"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          {title}
          {tooltip && (
            <>
              <Info
                size={14}
                className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                data-tooltip-id={tooltipId}
                data-tooltip-content={tooltip}
              />
              <Tooltip
                id={tooltipId}
                place="top"
                className="z-[1000] max-w-[220px] whitespace-pre-line text-xs px-2 py-1 rounded shadow-lg bg-gray-800 text-white"
              />
            </>
          )}
        </div>
        {badge !== undefined && title !== "Total Trades" && (
          <>
            <span
              className="text-xs bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 px-2 py-0.5 rounded-full font-semibold cursor-default"
              data-tooltip-id={badgeId}
              data-tooltip-content="Total number of trades"
            >
              {badge}
            </span>
            <Tooltip
              id={badgeId}
              place="top"
              className="z-50 text-xs px-2 py-1 rounded shadow-lg bg-gray-900 text-white"
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-between mt-2">
        <motion.div
          key={displayValue}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`text-2xl font-bold ${color}`}
        >
          {displayValue}
        </motion.div>
        {title === "Profit Factor" && (
          <div className="w-12 h-12 flex-shrink-0">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        )}
        {children && title !== "Profit Factor" && (
          <div className="w-10 h-10">{children}</div>
        )}
      </div>

      {/* Hover Icon */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-md p-1">
          <BarChart3 size={14} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
