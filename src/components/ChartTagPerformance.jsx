import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ChartTagPerformance = ({ data, onTagClick }) => {
  const handleBarClick = (data) => {
    const tag = data.activeLabel;
    if (tag && onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tag" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="avgPnL" fill="#7C3AED" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartTagPerformance;
