// src/components/DayWinPercentCard.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { valueAnimation, formatValue, RenderTooltip } from "../utils/statUtils.jsx";
import dayjs from "dayjs";

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip);

const DayWinPercentCard = ({ value, trades }) => {
  const [displayValue, setDisplayValue] = useState(value || "0.00"); // Initialize with "0.00" if value is undefined
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayValue(value || "0.00"), 50);
    return () => clearTimeout(timeout);
  }, [value]);

  // Cleanup tooltip on component unmount
  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById("chartjs-tooltip-day-win");
      if (tooltipEl) {
        tooltipEl.remove();
      }
    };
  }, []);

  // Calculate winning, breakeven, and losing days
  const safeTrades = Array.isArray(trades) ? trades : [];
  const tradingDays = [
    ...new Set(
      safeTrades
        .map((t) =>
          dayjs(t.entryTime).isValid()
            ? dayjs(t.entryTime).format("YYYY-MM-DD")
            : null
        )
        .filter((day) => day !== null)
    ),
  ];

  const dayStats = tradingDays.reduce(
    (acc, day) => {
      const dayPnL = safeTrades
        .filter((t) => dayjs(t.entryTime).format("YYYY-MM-DD") === day)
        .reduce((sum, t) => sum + (t.pnl || 0), 0);
      if (dayPnL > 0) acc.winningDays += 1;
      else if (dayPnL === 0) acc.breakevenDays += 1;
      else acc.losingDays += 1;
      return acc;
    },
    { winningDays: 0, breakevenDays: 0, losingDays: 0 }
  );

  // Only include segments with non-zero values
  const chartLabels = [];
  const chartValues = [];
  const chartColors = [];
  if (dayStats.winningDays > 0) {
    chartLabels.push("Winning Days");
    chartValues.push(dayStats.winningDays);
    chartColors.push("#16a34a"); // Green
  }
  if (dayStats.breakevenDays > 0) {
    chartLabels.push("Break-even Days");
    chartValues.push(dayStats.breakevenDays);
    chartColors.push("#3b82f6"); // Blue
  }
  if (dayStats.losingDays > 0) {
    chartLabels.push("Losing Days");
    chartValues.push(dayStats.losingDays);
    chartColors.push("#ef4444"); // Red
  }

  // Ensure at least one segment to avoid empty chart
  if (chartValues.length === 0) {
    chartLabels.push("No Data");
    chartValues.push(1);
    chartColors.push("#d1d5db"); // Gray for empty state
  }

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: chartColors,
        borderWidth: 0,
        cutout: "83%", // Thickness as specified
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90, // Start at the top (90 degrees counterclockwise)
    circumference: 180, // 180 degrees for a semi-circle
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false, // Disable default Chart.js tooltip
        external: (context) => {
          const { chart, tooltip } = context;
          let tooltipEl = document.getElementById("chartjs-tooltip-day-win");

          // Create tooltip element if it doesn't exist
          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip-day-win";
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
          tooltipEl.innerHTML = `${label}: ${value}`;

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
          Day Win %
          <RenderTooltip id="day-win-tooltip" content="Percentage of trading days with positive P&L." />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <motion.div
          {...valueAnimation}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {formatValue(displayValue, "percent")}
        </motion.div>
        <div className="flex flex-col items-center absolute right-6 top-1/2 transform -translate-y-1/2">
          {/* Semi-circular chart */}
          <div className="w-20 h-10 mb-1">
            <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
          </div>
          {/* Pill counters */}
          <div className="flex gap-2">
            {dayStats.winningDays > 0 && (
              <div
                className="flex items-center justify-center w-8 h-5 rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: "#16a34a" }}
              >
                {dayStats.winningDays}
              </div>
            )}
            {dayStats.breakevenDays > 0 && (
              <div
                className="flex items-center justify-center w-8 h-5 rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: "#3b82f6" }}
              >
                {dayStats.breakevenDays}
              </div>
            )}
            {dayStats.losingDays > 0 && (
              <div
                className="flex items-center justify-center w-8 h-5 rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: "#ef4444" }}
              >
                {dayStats.losingDays}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayWinPercentCard;
