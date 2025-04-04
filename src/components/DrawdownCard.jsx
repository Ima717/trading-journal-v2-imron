import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const DrawdownCard = ({ maxDrawdown = -842, recoveryFactor = 0.65 }) => {
  const drawdownAbs = Math.abs(maxDrawdown);
  const maxRange = 1000; // Assuming worst drawdown expected is ~$1,000
  const percent = Math.min((drawdownAbs / maxRange) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200/60 p-5 shadow-lg"
    >
      {/* Title */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Max Drawdown
        </h3>
        <span className="text-sm text-red-600 font-semibold flex items-center gap-1">
          <ArrowDown size={14} /> ${drawdownAbs.toFixed(2)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-zinc-700 relative overflow-hidden mb-3">
        <div
          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Recovery Factor */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">Recovery Factor</span>
        <span
          className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
            recoveryFactor > 1
              ? "bg-green-100 text-green-700"
              : recoveryFactor > 0.5
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {recoveryFactor.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
};

export default DrawdownCard;
