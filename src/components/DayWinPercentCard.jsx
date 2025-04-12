import React, { useEffect, useState } from "react";
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
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayValue(value), 50);
    return () => clearTimeout(timeout);
  }, [value]);

  // Calculate winning, breakeven, and losing days
  const tradingDays = [
    ...new Set(
      trades
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
      const dayPnL = trades
        .filter((t) => dayjs(t.entryTime).format("YYYY-MM-DD") === day)
        .reduce((sum, t) => sum + (t.pnl || 0), 0);
      if (dayPnL > 0) acc.winningDays += 1;
      else if (dayPnL === 0) acc.breakevenDays += 1;
      else acc.losingDays += 1;
      return acc;
    },
    { winningDays: 0, breakevenDays: 0, losingDays: 0 }
  );

  const chartData = {
    labels: ["Winning Days", "Breakeven Days", "Losing Days"],
    datasets: [
      {
        data: [
          dayStats.winningDays || 1,
          dayStats.breakevenDays || 1,
          dayStats.losingDays || 1,
        ],
        backgroundColor: ["#16a34a", "#3b82f6", "#ef4444"], // Green, Blue, Red
        borderWidth: 0,
        cutout: "75%", // Slightly smaller inner radius for a thicker gauge
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
      },
    },
  };

  return (
    <div className="p-6 rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] flex-1 h-24 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200 relative">
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
        <div className="flex flex-col items-center">
          {/* Semi-circular chart */}
          <div className="w-16 h-8 mb-1">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          {/* Pill counters */}
          <div className="flex gap-2">
            <div
              className="flex items-center justify-center w-8 h-5 rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: "#16a34a" }}
            >
              {dayStats.winningDays}
            </div>
            <div
              className="flex items-center justify-center w-8 h-5 rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: "#3b82f6" }}
            >
              {dayStats.breakevenDays}
            </div>
            <div
              className="flex items-center justify-center w-8 h-5 rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: "#ef4444" }}
            >
              {dayStats.losingDays}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayWinPercentCard;
