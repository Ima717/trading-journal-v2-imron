// components/MetricCard.jsx
import React from 'react';

const MetricCard = ({ title, value, trend }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">{title}</div>
      <div className="text-2xl font-semibold text-zinc-800 dark:text-white">{value}</div>
      {trend && (
        <div className={`text-sm mt-1 ${trend.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
          {trend} vs last period
        </div>
      )}
    </div>
  );
};

export default MetricCard;
