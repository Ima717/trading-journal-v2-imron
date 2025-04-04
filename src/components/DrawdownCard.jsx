import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const DrawdownCard = ({ maxDrawdown = -842, recoveryFactor = 0.65 }) => {
  const drawdownAbs = Math.abs(maxDrawdown);
  const maxRange = 1000; // Adjust this to your typical max DRAWDOWN range
  const percent = Math.min((drawdownAbs / maxRange) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200/60 p-5 shadow-lg"
    >
      {/* Max Drawdown */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Max Drawdown
        </h3>
        <span className="text-sm text-red-600 font-semibold flex items-center gap-1">
          <ArrowDown size={14} />
          -${drawdownAbs.toFixed(2)}
        </span>
      </div>

      {/* Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="absolute top-0 left-0 h-2 rounded-full"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(to right, #f87171, #b91c1c)",
          }}
        />
      </div>

      {/* Recovery Factor */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500 dark:text-gray-400">Recovery Factor</span>
        <span
          className={`font-semibold px-2 py-0.5 rounded-full ${
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
