// StatCard.jsx — Final Fixed Version with conditional styling only for Trade Win %

import React from "react";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";
import { Info, BarChart3, TrendingUp } from "lucide-react";

const StatCard = ({ title, value, color, tooltip, badge }) => {
  const isWinRateCard = title === "Trade Win %";

  const getBackgroundClass = () => {
    if (!isWinRateCard) return "bg-white dark:bg-zinc-800";
    const winRate = parseFloat(value);
    if (winRate >= 70) return "bg-gradient-to-r from-green-400 to-green-600 text-white";
    if (winRate >= 50) return "bg-gradient-to-r from-yellow-300 to-yellow-500 text-white";
    return "bg-gradient-to-r from-red-400 to-red-600 text-white";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative ${getBackgroundClass()} p-6 rounded-xl shadow-sm w-full flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200 group overflow-hidden`}
    >
      {/* Header Row with Title, Info, and Badge */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">
            {title}
          </span>
          {tooltip && (
            <>
              <Info
                size={14}
                className="opacity-70 hover:opacity-100 cursor-pointer"
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
              className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold cursor-default"
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
      <div className={`text-2xl font-bold ${color ?? ""}`}>{value}</div>

      {/* Optional corner icon */}
      {isWinRateCard && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 text-white rounded-md p-1">
            <TrendingUp size={14} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
