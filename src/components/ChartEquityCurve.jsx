import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const ChartEquityCurve = ({ data }) => {
  // Sample fallback if data not passed in yet
  const sampleLabels = ["Mar 15", "Mar 17", "Mar 19", "Mar 21", "Mar 23", "Mar 25", "Mar 27", "Mar 29", "Apr 1"];
  const sampleData = [-100, 50, 200, -150, -400, -600, -800, -900, -850];

  const chartData = {
    labels: data?.map((d) => d.date) || sampleLabels,
    datasets: [
      {
        label: "Net Cumulative P&L",
        data: data?.map((d) => d.pnl) || sampleData,
        fill: true,
        backgroundColor: "rgba(34,197,94,0.1)",
        borderColor: "#22c55e",
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#6b7280",
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: { color: "#e5e7eb" },
        ticks: {
          color: "#6b7280",
          callback: (val) => `$${val}`,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm w-full"
    >
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-semibold">
        📈 Equity Curve
      </h3>

      <div className="relative h-[280px]">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

export default ChartEquityCurve;
