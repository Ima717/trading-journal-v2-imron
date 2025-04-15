// src/components/DailyTradeModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import dayjs from "dayjs";

const DailyTradeModal = ({ isOpen, onClose, selectedDate, trades, formatPnL }) => {
  // Filter trades for the selected date
  const selectedTrades = trades.filter((trade) =>
    dayjs(trade.date).isSame(selectedDate, "day")
  );

  // Calculate daily analytics
  const dailyAnalytics = selectedTrades.length
    ? {
        netPnL: selectedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0),
        totalTrades: selectedTrades.length,
        wins: selectedTrades.filter((trade) => (trade.pnl || 0) > 0).length,
        volume: selectedTrades.reduce((sum, trade) => sum + (trade.amount || 0), 0),
        grossProfit: selectedTrades
          .filter((trade) => (trade.pnl || 0) > 0)
          .reduce((sum, trade) => sum + (trade.pnl || 0), 0),
        grossLoss: Math.abs(
          selectedTrades
            .filter((trade) => (trade.pnl || 0) < 0)
            .reduce((sum, trade) => sum + (trade.pnl || 0), 0)
        ),
        commissions: selectedTrades.reduce(
          (sum, trade) => sum + (trade.commission || 0) + (trade.fees || 0),
          0
        ),
      }
    : null;

  if (dailyAnalytics) {
    dailyAnalytics.winRate = dailyAnalytics.totalTrades > 0 ? (dailyAnalytics.wins / dailyAnalytics.totalTrades) * 100 : 0;
    dailyAnalytics.profitFactor = dailyAnalytics.grossLoss > 0 ? dailyAnalytics.grossProfit / dailyAnalytics.grossLoss : dailyAnalytics.grossProfit > 0 ? Infinity : 0;
    dailyAnalytics.profitFactor = dailyAnalytics.profitFactor === Infinity ? "Infinity" : dailyAnalytics.profitFactor.toFixed(2);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
            tabIndex={0}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Trades on {selectedDate.format("MMMM D, YYYY")}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {selectedTrades.length > 0 ? (
                <>
                  {/* Daily Analytics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Net P&L</span>
                      <span className={`text-lg font-semibold ${dailyAnalytics.netPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatPnL(dailyAnalytics.netPnL)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Trades</span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        {dailyAnalytics.totalTrades}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Win Rate</span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        {dailyAnalytics.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Volume</span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        ${dailyAnalytics.volume.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Profit Factor</span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        {dailyAnalytics.profitFactor}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Gross Profit</span>
                      <span className="text-lg font-semibold text-green-600">
                        ${dailyAnalytics.grossProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Gross Loss</span>
                      <span className="text-lg font-semibold text-red-600">
                        -${dailyAnalytics.grossLoss.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Commissions</span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        ${dailyAnalytics.commissions.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Trade Breakdown Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-800 dark:text-gray-200">
                      <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-zinc-700">
                        <tr>
                          <th scope="col" className="px-4 py-2">Open Time</th>
                          <th scope="col" className="px-4 py-2">Ticker</th>
                          <th scope="col" className="px-4 py-2">Side</th>
                          <th scope="col" className="px-4 py-2">Instrument</th>
                          <th scope="col" className="px-4 py-2">Net P&L</th>
                          <th scope="col" className="px-4 py-2">ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTrades.map((trade, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
                          >
                            <td className="px-4 py-2">{dayjs(trade.entryTime).format("HH:mm:ss")}</td>
                            <td className="px-4 py-2">{trade.ticker || "N/A"}</td>
                            <td className="px-4 py-2">{trade.side || "N/A"}</td>
                            <td className="px-4 py-2">{trade.instrument || "N/A"}</td>
                            <td className={`px-4 py-2 ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {formatPnL(trade.pnl || 0)}
                            </td>
                            <td className="px-4 py-2">{trade.roi ? `${trade.roi.toFixed(2)}%` : "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-gray-400 dark:text-gray-500 text-4xl mb-4"
                  >
                    📅
                  </motion.div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No trades were made on this day.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyTradeModal;
