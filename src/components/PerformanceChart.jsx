import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PerformanceChart = ({ data }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 h-72 my-6">
      <h2 className="text-md font-medium mb-3 text-zinc-800 dark:text-white">
        📈 PnL Over Time
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="pnl"
            stroke="#4ade80"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
