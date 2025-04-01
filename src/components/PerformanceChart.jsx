import React from "react";
import { Line } from "recharts";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Area } from "recharts";
import { motion } from "framer-motion";

const PerformanceChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-sm text-gray-500">No data available.</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke="#3B82F6"
            fill="#FECACA"
            fillOpacity={0.3}
          />
          <Line type="monotone" dataKey="pnl" stroke="#3B82F6" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default PerformanceChart;
