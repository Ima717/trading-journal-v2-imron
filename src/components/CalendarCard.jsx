import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import dayjs from "dayjs";
import { Tooltip as ReactTooltip } from "react-tooltip";

const CalendarCard = ({ trades = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [animating, setAnimating] = useState(false);

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  // 🔍 Build date-to-analytics map (PnL, number of trades, percentage)
  const tradeMap = useMemo(() => {
    const map = { pnl: {}, tradesCount: {}, percentage: {} };
    trades.forEach((t) => {
      const date = dayjs(t.date).format("YYYY-MM-DD");
      if (!map.pnl[date]) {
        map.pnl[date] = 0;
        map.tradesCount[date] = 0;
        map.percentage[date] = 0;
      }
      map.pnl[date] += t.pnl || 0;
      map.tradesCount[date] += 1;
      map.percentage[date] = t.percentage || 0;
    });
    return map;
  }, [trades]);

  // 📊 Calculate monthly stats
  const monthlyStats = useMemo(() => {
    let totalPnL = 0;
    let tradingDays = 0;
    let totalTrades = 0;
    Object.keys(tradeMap.pnl).forEach((date) => {
      if (dayjs(date).isSame(currentMonth, "month")) {
        totalPnL += tradeMap.pnl[date];
        totalTrades += tradeMap.tradesCount[date];
        tradingDays++;
      }
    });
    return { totalPnL, tradingDays, totalTrades };
  }, [tradeMap, currentMonth]);

  // 📅 Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const weeks = [];
    let currentWeek = [];
    let weekStart = startOfMonth;

    days.forEach((day, index) => {
      currentWeek.push(day);
      if (day.day() === 6 || index === days.length - 1) {
        const weekPnL = currentWeek.reduce((sum, d) => {
          const key = d.format("YYYY-MM-DD");
          return sum + (tradeMap.pnl[key] || 0);
        }, 0);
        const tradingDays = currentWeek.filter((d) =>
          tradeMap.pnl[d.format("YYYY-MM-DD")]
        ).length;
        const totalTrades = currentWeek.reduce((sum, d) => {
          const key = d.format("YYYY-MM-DD");
          return sum + (tradeMap.tradesCount[key] || 0);
        }, 0);
        weeks.push({ weekPnL, tradingDays, totalTrades });
        currentWeek = [];
      }
    });

    return weeks;
  }, [tradeMap, days, startOfMonth]);

  const handlePrevMonth = () => {
    if (animating) return;
    setAnimating(true);
    setCurrentMonth((prev) => prev.subtract(1, "month"));
    setTimeout(() => setAnimating(false), 300);
  };

  const handleNextMonth = () => {
    if (animating) return;
    setAnimating(true);
    setCurrentMonth((prev) => prev.add(1, "month"));
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200/60 p-5 shadow-lg w-full h-[850px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {currentMonth.format("MMMM YYYY")}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            This month
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-lg font-semibold ${
              monthlyStats.totalPnL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {monthlyStats.totalPnL >= 0 ? "+" : ""}${monthlyStats.totalPnL.toFixed(0)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {monthlyStats.tradingDays} days
          </span>
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            title="Settings (coming soon)"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Content: Calendar + Weekly Stats */}
      <div className="flex flex-1 gap-4">
        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-0 text-sm text-center text-gray-500 dark:text-gray-400 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="font-medium p-2">
                {d}
              </div>
            ))}
          </div>

          {/* Animated Month */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMonth.format("MM-YYYY")}
              initial={{ opacity: 0, filter: "blur(5px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(5px)" }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-7 gap-0 text-sm text-gray-800 dark:text-white"
            >
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-[90px]" />
              ))}

              {days.map((date) => {
                const key = date.format("YYYY-MM-DD");
                const pnl = tradeMap.pnl[key];
                const tradesCount = tradeMap.tradesCount[key];
                const percentage = tradeMap.percentage[key];
                const tooltipId = `tooltip-${key}`;

                return (
                  <div
                    key={key}
                    className="h-[90px] flex items-center justify-center"
                  >
                    <motion.div
                      data-tooltip-id={tooltipId}
                      data-tooltip-content={
                        pnl !== undefined
                          ? `${key}: ${pnl < 0 ? "-" : ""}$${Math.abs(pnl).toFixed(2)} | Trades: ${tradesCount}`
                          : null
                      }
                      whileHover={{ scale: 1.05 }}
                      className={`rounded-lg w-full h-full flex flex-col items-center justify-center cursor-pointer border transition-all duration-200 p-2
                        ${
                          pnl !== undefined
                            ? pnl >= 0
                              ? "bg-green-100/50 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                              : "bg-red-100/50 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                            : "hover:bg-purple-100/60 dark:hover:bg-purple-900/30 border-transparent hover:border-purple-400 dark:hover:border-purple-600"
                        }`}
                    >
                      <span className="font-medium">{date.date()}</span>
                      {pnl !== undefined && (
                        <>
                          <span
                            className={`text-xs font-semibold ${
                              pnl >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {percentage}%
                          </span>
                          <span className="text-xs text-gray-400">
                            {tradesCount} trades
                          </span>
                        </>
                      )}
                    </motion.div>

                    {pnl !== undefined && (
                      <ReactTooltip
                        id={tooltipId}
                        place="top"
                        className="z-[1000] text-xs px-2 py-1 rounded shadow-lg bg-gray-900 text-white"
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Weekly Stats */}
        <div className="w-[150px] flex flex-col gap-3">
          {weeklyStats.map((week, index) => (
            <div
              key={`week-${index}`}
              className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-3 text-sm h-[90px] flex flex-col items-center justify-center"
            >
              <div className="text-gray-500 dark:text-gray-400">
                Week {index + 1}
              </div>
              <div
                className={`text-lg font-semibold ${
                  week.weekPnL >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {week.weekPnL >= 0 ? "+" : ""}${week.weekPnL.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {week.tradingDays} days
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {week.totalTrades} trades
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarCard;
