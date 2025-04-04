import React from "react";

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-4 w-full h-full flex flex-col">
      {title && (
        <h2 className="text-sm font-semibold text-gray-700 dark:text-white mb-3">
          {title}
        </h2>
      )}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
