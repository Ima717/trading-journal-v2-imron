// components/RecentTradesCard.jsx

import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import dayjs from "dayjs";

const RecentTradesCard = ({ trades = [] }) => {
  const sorted = [...trades].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200/60 p-5 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
          Recent Trades
        </h3>
        <Clock size={16} className="text-gray-400" />
      </div>

      <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-1">
        {sorted.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">No trades found.</div>
        ) : (
          sorted.map((trade) => (
            <div
              key={trade.id}
              className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {trade.symbol || "—"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {dayjs(trade.date).format("MMM D, YYYY")}
                </span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  trade.pnl >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {trade.pnl >= 0 ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default RecentTradesCard;
