import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const DrawdownCard = ({ maxDrawdown = 0, recoveryFactor = 0 }) => {
  const drawdownAbs = Math.abs(maxDrawdown);
  const maxRange = Math.max(drawdownAbs * 1.2, 1000); // Dynamic range
  const percent = Math.min((drawdownAbs / maxRange) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[300px] flex flex-col"
    >
      {/* Title and Max Drawdown */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-white">
          Max Drawdown
        </h3>
        <span className="text-sm text-red-600 font-semibold flex items-center gap-1">
          <ArrowDown size={14} /> {drawdownAbs.toFixed(2)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-zinc-700 relative overflow-hidden mb-2">
        <div
          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Recovery Factor */}
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="text-gray-500 dark:text-gray-400">Recovery Factor</span>
        <span
          className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
            recoveryFactor > 1
              ? "bg-green-100 text-green-700"
              : recoveryFactor > 0.5
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          } dark:bg-opacity-50 dark:text-gray-300`}
        >
          {recoveryFactor.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
};

export default DrawdownCard;
