import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import dayjs from "dayjs";
import { Tooltip as ReactTooltip } from "react-tooltip";

const CalendarCard = ({ trades = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [animating, setAnimating] = useState(false);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  // 🔍 Build date-to-PnL map
  const tradeMap = useMemo(() => {
    const map = {};
    trades.forEach((t) => {
      const date = dayjs(t.date).format("YYYY-MM-DD");
      if (!map[date]) map[date] = 0;
      map[date] += t.pnl || 0;
    });
    return map;
  }, [trades]);

  const handlePrevMonth = () => {
    if (animating) return;
    setAnimating(true);
    setCurrentMonth((prev) => prev.subtract(1, "month"));
    setTimeout(() => setAnimating(false), 250);
  };

  const handleNextMonth = () => {
    if (animating) return;
    setAnimating(true);
    setCurrentMonth((prev) => prev.add(1, "month"));
    setTimeout(() => setAnimating(false), 250);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200/60 p-5 shadow-lg w-full h-[700px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md font-semibold text-gray-800 dark:text-white">
          {currentMonth.format("MMMM YYYY")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            title="Settings (coming soon)"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 text-sm text-center text-gray-500 dark:text-gray-400 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Animated Month */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.format("MM-YYYY")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-7 gap-2 text-sm text-gray-800 dark:text-white flex-1"
        >
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((date) => {
            const key = date.format("YYYY-MM-DD");
            const pnl = tradeMap[key];
            const tooltipId = `tooltip-${key}`;

            return (
              <div key={key}>
                <motion.div
                  data-tooltip-id={tooltipId}
                  data-tooltip-content={
                    pnl !== undefined
                      ? `${key}: ${pnl < 0 ? "-" : ""}$${Math.abs(pnl).toFixed(2)}`
                      : null
                  }
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-lg h-[60px] flex items-center justify-center cursor-pointer border transition-all duration-200
                    ${
                      pnl !== undefined
                        ? pnl >= 0
                          ? "bg-green-100/30 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                          : "bg-red-100/30 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                        : "hover:bg-purple-100/60 dark:hover:bg-purple-900/30 border-transparent hover:border-purple-400 dark:hover:border-purple-600"
                    }`}
                >
                  {date.date()}
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
    </motion.div>
  );
};

export default CalendarCard;
