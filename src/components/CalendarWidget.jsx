import React from "react";
import dayjs from "dayjs";
import { useFilters } from "../context/FilterContext";
import { motion } from "framer-motion";

const CalendarWidget = () => {
  const { filteredTrades, setDateRange } = useFilters();
  const today = dayjs();
  const startOfMonth = today.startOf("month");
  const endOfMonth = today.endOf("month");

  const daysInMonth = endOfMonth.date();
  const startWeekday = startOfMonth.day();
  const totalCells = startWeekday + daysInMonth;
  const currentMonth = today.format("MMMM YYYY");

  const dayStats = {};
  filteredTrades.forEach((trade) => {
    const date = dayjs(trade.date).date();
    if (!dayStats[date]) {
      dayStats[date] = { pnl: 0, trades: 0, wins: 0 };
    }
    dayStats[date].pnl += trade.pnl || 0;
    dayStats[date].trades += 1;
    if (trade.pnl > 0) dayStats[date].wins += 1;
  });

  const handleDayClick = (e, day) => {
    e.preventDefault();
    const clickedDate = dayjs().date(day).format("YYYY-MM-DD");
    setDateRange({ start: clickedDate, end: clickedDate });
  };

  const getColor = (pnl) => {
    if (pnl > 0) return "bg-green-400/80 hover:bg-green-500";
    if (pnl < 0) return "bg-red-400/80 hover:bg-red-500";
    return "bg-gray-300 hover:bg-gray-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm"
    >
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-white mb-3">
        📅 Trading Calendar — {currentMonth}
      </h3>

      <div className="grid grid-cols-7 gap-1 text-[11px] text-center font-medium text-zinc-500 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: totalCells }).map((_, idx) => {
          const day = idx - startWeekday + 1;
          const isBlank = day <= 0;
          const stats = dayStats[day];
          const winRate = stats && stats.trades
            ? (stats.wins / stats.trades) * 100
            : 0;

          return (
            <button
              key={idx}
              onClick={(e) => stats && handleDayClick(e, day)}
              className={`rounded-md h-14 w-full flex flex-col items-center justify-center text-[10px] cursor-pointer transition-all duration-200 ${
                isBlank ? "bg-transparent" : stats ? getColor(stats.pnl) : "bg-gray-200"
              } ${stats ? "text-white font-semibold" : "text-zinc-600"}`}
            >
              {!isBlank && (
                <>
                  <span className="text-xs">{day}</span>
                  {stats && (
                    <>
                      <span>${stats.pnl.toFixed(0)}</span>
                      <span className="text-[10px]">{winRate.toFixed(0)}%</span>
                    </>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CalendarWidget;
