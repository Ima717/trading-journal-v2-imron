import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { valueAnimation, formatValue, RenderTooltip } from "../utils/statUtils";

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip);

const ProfitFactorCard = ({ value, trades }) => {
  const [displayValue, setDisplayValue] = useState(value);

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
        backgroundColor: ["#16a34a", "#ef4444"],
        borderWidth: 0,
        cutout: "50%",
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
        callbacks: {
          label: (context) =>
            `${context.label}: $${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div className="p-6 rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[200px] max-w-[300px] h-24 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          Profit Factor
          <RenderTooltip id="profit-factor-tooltip" content="Gross profit / gross loss." />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <motion.div
          {...valueAnimation}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {displayValue}
        </motion.div>
        <div className="w-10 h-10 flex-shrink-0 mr-2">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ProfitFactorCard;
