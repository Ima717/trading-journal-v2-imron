import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { valueAnimation, formatValue, RenderTooltip } from "../utils/statUtils.jsx";

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip);

const AvgWinLossCard = ({ value, trades }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayValue(value), 50);
    return () => clearTimeout(timeout);
  }, [value]);

  // Cleanup tooltip on component unmount
  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById("chartjs-tooltip-avg-win-loss");
      if (tooltipEl) {
        tooltipEl.remove();
      }
    };
  }, []);

  // Calculate average winning and losing trade amounts
  const wins = trades ? trades.filter((t) => t.pnl > 0) : [];
  const losses = trades ? trades.filter((t) => t.pnl < 0) : [];
  const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0;

  // Chart data (use absolute values for the bar, but show signed values in tooltip)
  const chartData = {
    labels: ["Average Winning Trade", "Average Losing Trade"],
    datasets: [
      {
        data: [avgWin || 1, avgLoss || 1], // Fallback to 1 to avoid empty chart
        backgroundColor: ["#16a34a", "#ef4444"], // Green, Red
        borderWidth: 0,
        cutout: "90%", // High cutout for a thin bar-like appearance
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90, // Start at the top
    circumference: 180, // 180 degrees for a semi-circle (horizontal bar)
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false, // Disable default Chart.js tooltip
        external: (context) => {
          const { chart, tooltip } = context;
          let tooltipEl = document.getElementById("chartjs-tooltip-avg-win-loss");

          // Create tooltip element if it doesn't exist
          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip-avg-win-loss";
            tooltipEl.style.opacity = 0;
            tooltipEl.style.position = "absolute";
            tooltipEl.className = "bg-white dark:bg-zinc-800 rounded-xl shadow-sm px-4 py-2 text-gray-900 dark:text-gray-100 text-xs font-medium";
            tooltipEl.style.pointerEvents = "none";
            tooltipEl.style.zIndex = "1000";
            tooltipEl.style.transition = "opacity 0.1s ease, box-shadow 0.1s ease";
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip data (e.g., mouse leaves)
          if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            tooltipEl.style.boxShadow = "none";
            return;
          }

          // Set tooltip content
          const label = tooltip.dataPoints[0].label;
          const value = tooltip.dataPoints[0].raw;
          const displayValue = label === "Average Winning Trade" ? value : -value; // Show negative for losing trades
          tooltipEl.innerHTML = `${label}: $${displayValue.toFixed(2)}`;

          // Position tooltip in the middle of the widget container
          const widgetContainer = chartContainerRef.current;
          if (widgetContainer) {
            const rect = widgetContainer.getBoundingClientRect();
            const tooltipWidth = tooltipEl.offsetWidth;
            const tooltipHeight = tooltipEl.offsetHeight;

            // Center horizontally and vertically within the widget container
            const left = Math.max(0, Math.min(rect.left + (rect.width - tooltipWidth) / 2, window.innerWidth - tooltipWidth));
            const top = Math.max(0, Math.min(rect.top + (rect.height - tooltipHeight) / 2, window.innerHeight - tooltipHeight));

            tooltipEl.style.opacity = 1;
            tooltipEl.style.left = `${left}px`;
            tooltipEl.style.top = `${top}px`;
            tooltipEl.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"; // shadow-md
          }
        },
      },
    },
  };

  return (
    <div
      ref={chartContainerRef}
      className="p-6 rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] flex-1 h-24 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200 relative"
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          Avg Win/Loss
          <RenderTooltip id="avg-win-loss-tooltip" content="The average profit on all winning and losing trades." />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <motion.div
          {...valueAnimation}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {displayValue}
        </motion.div>
        {/* Absolutely position the progress bar in the middle-right */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-40 h-4">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AvgWinLossCard;
