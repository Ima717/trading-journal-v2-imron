import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, subValue, color, tooltip, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm flex flex-col items-start"
    >
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-2">{title}</h3>
      {children ? (
        children
      ) : (
        <div className="flex flex-col">
          <span className={`text-lg font-semibold ${color || "text-gray-800 dark:text-white"}`}>
            {value}
          </span>
          {subValue && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{subValue}</span>
          )}
        </div>
      )}
      {tooltip && (
        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{tooltip}</span>
      )}
    </motion.div>
  );
};

export default StatCard;
