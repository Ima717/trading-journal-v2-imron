// StatCard.jsx — Upgraded with special styling for Win Rate + tooltips + badges

import React from "react";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";
import { Info, TrendingUp } from "lucide-react";

const StatCard = ({
  title,
  value,
  color = "text-gray-900 dark:text-white",
  tooltip,
  badge,
}) => {
  // Special styling logic for Win Rate
  const isWinRate = title.toLowerCase().includes("win %");
  const winRate = parseFloat(value);
  const bgGradient =
    winRate >= 70
      ? "from-green-300 to-green-500"
      : winRate >= 50
      ? "from-yellow-300 to-yellow-500"
      : "from-red-300 to-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative p-6 rounded-xl shadow-sm w-full flex flex-col justify-between transition-all duration-200 group overflow-hidden hover:shadow-md hover:scale-[1.02] ${
        isWinRate ? "bg-gradient-to-br text-white" : "bg-white dark:bg-zinc-800"
      }`}
    >
      {/* Header Row with Title, Info, and Badge */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1">
          <span
            className={`text-xs font-medium ${
              isWinRate ? "text-white/80" : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {title}
          </span>
          {tooltip && (
            <>
              <Info
                size={14}
                className={`${
                  isWinRate
                    ? "text-white/70 hover:text-white"
                    : "text-gray-400 hover:text-black dark:hover:text-white"
                } cursor-pointer`}
                data-tooltip-id={`tooltip-${title}`}
                data-tooltip-content={tooltip}
              />
              <Tooltip id={`tooltip-${title}`} place="top" className="z-50" />
            </>
          )}
        </div>

        {badge !== undefined && (
          <>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold cursor-default ${
                isWinRate
                  ? "bg-white/10 text-white"
                  : "bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-100"
              }`}
              data-tooltip-id={`badge-${title}`}
              data-tooltip-content="Total number of trades"
            >
              {badge}
            </span>
            <Tooltip id={`badge-${title}`} place="top" className="z-50" />
          </>
        )}
      </div>

      {/* Main Value */}
      <div className={`text-2xl font-bold ${isWinRate ? "text-white" : color}`}>{value}</div>

      {/* Optional corner icon */}
      {isWinRate && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/10 text-white rounded-md p-1">
            <TrendingUp size={14} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
