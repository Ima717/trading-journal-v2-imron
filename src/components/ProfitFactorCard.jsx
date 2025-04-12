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

const ProfitFactorCard = ({ value, trades }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayValue(value), 50);
    return () => clearTimeout(timeout);
  }, [value]);

  const totalProfit = trades
    ? trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    : 0;
  const totalLoss = trades
    ? Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    : 0;

  const chartData = {
    labels: ["Total Profit", "Total Loss"],
    datasets: [
      {
        data: [totalProfit || 1, totalLoss || 1],
        backgroundColor: ["#16a34a", "#ef4444"], // Matches Net P&L colors
        borderWidth: 0,
        cutout: "80%",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        // Use external to control tooltip rendering
        external: (context) => {
          const { chart, tooltip } = context;
          let tooltipEl = document.getElementById("chartjs-tooltip");

          // Create tooltip element if it doesn't exist
          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.style.opacity = 0;
            tooltipEl.style.position = "absolute";
            tooltipEl.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            tooltipEl.style.color = "white";
            tooltipEl.style.padding = "5px 10px";
            tooltipEl.style.borderRadius = "3px";
            tooltipEl.style.pointerEvents = "none";
            tooltipEl.style.zIndex = "1000";
            tooltipEl.style.transition = "opacity 0.1s ease";
            document.body.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }

          // Set tooltip content
          tooltipEl.innerHTML = tooltip.body.map((bodyItem) => bodyItem.lines).join("");

          // Position tooltip in the middle of the widget container
          const widgetContainer = chartContainerRef.current;
          if (widgetContainer) {
            const rect = widgetContainer.getBoundingClientRect();
            const tooltipWidth = tooltipEl.offsetWidth;
            const tooltipHeight = tooltipEl.offsetHeight;

            // Center horizontally and vertically within the widget container
            const left = rect.left + (rect.width - tooltipWidth) / 2;
            const top = rect.top + (rect.height - tooltipHeight) / 2;

            tooltipEl.style.opacity = 1;
            tooltipEl.style.left = `${left}px`;
            tooltipEl.style.top = `${top}px`;
          }
        },
        callbacks: {
          label: (context) =>
            `${context.label}: $${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div
      ref={chartContainerRef}
      className="p-6 rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[200px] flex-1 h-24 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200 relative"
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          Profit Factor
          <RenderTooltip id="profit-factor-tooltip" content="Gross profit / gross loss." />
        </div>
      </div>
      <motion.div
        {...valueAnimation}
        className="text-2xl font-bold text-gray-900 dark:text-white"
      >
        {displayValue}
      </motion.div>
      {/* Absolutely position the donut chart in the middle-right */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-16 h-16">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ProfitFactorCard;
