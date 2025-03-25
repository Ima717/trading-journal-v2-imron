// src/components/ChartTagPerformance.jsx

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ChartTagPerformance = ({ data, onTagClick }) => {
  const handleBarClick = (bar) => {
    const tag = bar.activeLabel;
    if (tag && onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="tag" type="category" />
          <Tooltip />
          <Bar
            dataKey="avgPnL"
            fill="#a855f7"
            radius={[10, 10, 10, 10]}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartTagPerformance;
