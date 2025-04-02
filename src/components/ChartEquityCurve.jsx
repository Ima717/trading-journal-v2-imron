import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { useFilters } from "../context/FilterContext";
import { motion } from "framer-motion";
import dayjs from "dayjs";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler
);

const ChartEquityCurve = () => {
  const { filteredTrades } = useFilters();

  const { labels, cumulativePnl } = useMemo(() => {
    let runningTotal = 0;
    const sorted = [...filteredTrades].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const labels = [];
    const cumulativePnl = [];

    sorted.forEach((trade) => {
      runningTotal += trade.pnl || 0;
      labels.push(dayjs(trade.date).format("YYYY-MM-DD"));
      cumulativePnl.push(runningTotal);
    });

    return { labels, cumulativePnl };
  }, [filteredTrades]);

  if (!labels.length) return null;

  const data = {
    labels,
    datasets: [
      {
        label: "Net Cumulative P&L",
        data: cumulativePnl,
        fill: true,
        backgroundColor: "rgba(34, 197, 94, 0.08)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700 },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "PP"
        },
        grid: { display: false },
        ticks: {
          color: "#9ca3af",
          font: { family: "Inter", size: 11 }
        }
      },
      y: {
        ticks: {
          color: "#6b7280",
          font: { family: "Inter", size: 11 }
        },
        grid: {
          color: "#e5e7eb"
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#f9fafb",
        bodyColor: "#f9fafb",
        padding: 10,
        cornerRadius: 4
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm"
    >
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-semibold">
        📈 Net Cumulative P&L
      </h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </motion.div>
  );
};

export default ChartEquityCurve;
