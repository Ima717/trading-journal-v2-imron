import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import dayjs from "dayjs";

const RecentTradesCard = ({ trades = [] }) => {
  const [visibleTrades, setVisibleTrades] = useState(15);
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleShowMore = () => {
    setVisibleTrades((prev) => prev + 15);
  };

  const rowVariants = {
    rest: { y: 0, opacity: 1 },
    hover: { y: -2, opacity: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[855px] bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200/60 p-5 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white tracking-wide">
          Recent Trades
        </h3>
        <Clock size={16} className="text-gray-400" />
      </div>

      {/* Column Headers */}
      <div className="flex justify-between items-center p-3 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 font-semibold rounded-t-lg mb-2">
        <span className="w-1/3 text-left">Date</span>
        <span className="w-1/3 text-left">Symbol</span>
        <span className="w-1/3 text-right">Net P/L</span>
      </div>

      {/* Trade List (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        {sortedTrades.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No trades found.
          </div>
        ) : (
          sortedTrades.slice(0, visibleTrades).map((trade) => (
            <motion.div
              key={trade.id}
              variants={rowVariants}
              initial="rest"
              whileHover="hover"
              className="flex justify-between items-center px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-zinc-700/50 hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
            >
              <span className="text-sm text-gray-600 dark:text-gray-300 w-1/3">
                {dayjs(trade.date).format("DD/MM/YYYY")}
              </span>
              <div className="flex flex-col items-start w-1/3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {trade.symbol || "—"}
                </span>
                {trade.optionType && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {trade.optionType === "call" ? "Call" : "Put"}
                  </span>
                )}
              </div>
              <span
                className={`text-sm font-semibold w-1/3 text-right ${
                  trade.pnl >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {trade.pnl >= 0 ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
              </span>
            </motion.div>
          ))
        )}
      </div>

      {/* Show More Button */}
      {sortedTrades.length > visibleTrades && (
        <div className="mt-4 text-center">
          <button
            onClick={handleShowMore}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Show more trades
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecentTradesCard;
