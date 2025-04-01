// StatCard.jsx — Updated for Net P&L + Win Rate with full fixes and donut-style Profit Factor

import React from "react";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";
import { Info, BarChart3 } from "lucide-react";

const StatCard = ({
  title,
  value,
  color = "text-gray-900 dark:text-white",
  tooltip,
  badge,
  customBg = "",
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative p-6 rounded-xl shadow-sm w-full flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200 group overflow-hidden ${customBg || "bg-white dark:bg-zinc-800"}`}
    >
      {/* Header Row with Title, Info, and Badge */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {title}
          </span>
          {tooltip && (
            <>
              <Info
                size={14}
                className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                data-tooltip-id={`tooltip-${title}`}
                data-tooltip-content={tooltip}
              />
              <Tooltip
                id={`tooltip-${title}`}
                place="top"
                className="z-[1000] max-w-[200px] whitespace-pre-line text-xs px-2 py-1 rounded shadow-lg bg-gray-800 text-white"
              />
            </>
          )}
        </div>

        {badge !== undefined && (
          <>
            <span
              className="text-xs bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 px-2 py-0.5 rounded-full font-semibold cursor-default"
              data-tooltip-id={`badge-${title}`}
              data-tooltip-content="Total number of trades"
            >
              {badge}
            </span>
            <Tooltip
              id={`badge-${title}`}
              place="top"
              className="z-50 text-xs px-2 py-1 rounded shadow-lg bg-gray-900 text-white"
            />
          </>
        )}
      </div>

      {/* Main Value or Custom Chart */}
      {children ? (
        <div className="mt-2">{children}</div>
      ) : (
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      )}

      {/* Optional corner icon */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-md p-1">
          <BarChart3 size={14} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
