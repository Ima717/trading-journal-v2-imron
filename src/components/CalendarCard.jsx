// Updated CalendarCard with all the requested enhancements
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import dayjs from "dayjs";
import { Tooltip as ReactTooltip } from "react-tooltip";

const CalendarCard = ({ trades = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [animating, setAnimating] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const dropdownRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showPnL, setShowPnL] = useState(() => JSON.parse(localStorage.getItem("showPnL")) ?? true);
  const [showWinRate, setShowWinRate] = useState(() => JSON.parse(localStorage.getItem("showWinRate")) ?? false);
  const [showTrades, setShowTrades] = useState(() => JSON.parse(localStorage.getItem("showTrades")) ?? false);
  const [heatmapMode, setHeatmapMode] = useState(() => JSON.parse(localStorage.getItem("heatmapMode")) ?? false);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("showPnL", showPnL);
    localStorage.setItem("showWinRate", showWinRate);
    localStorage.setItem("showTrades", showTrades);
    localStorage.setItem("heatmapMode", heatmapMode);
  }, [showPnL, showWinRate, showTrades, heatmapMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();
  const days = Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, "day"));
  const totalWeeks = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
  const rowHeight = 700 / totalWeeks;

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

  const weeklyStats = useMemo(() => {
    const weeks = [];
    let currentWeek = [];
    days.forEach((day, index) => {
      currentWeek.push(day);
      if (day.day() === 6 || index === days.length - 1) {
        const weekPnL = currentWeek.reduce((sum, d) => sum + (tradeMap.pnl[d.format("YYYY-MM-DD")] || 0), 0);
        const tradingDays = currentWeek.filter((d) => tradeMap.pnl[d.format("YYYY-MM-DD")]).length;
        const totalTrades = currentWeek.reduce((sum, d) => sum + (tradeMap.tradesCount[d.format("YYYY-MM-DD")] || 0), 0);
        weeks.push({ weekPnL, tradingDays, totalTrades });
        currentWeek = [];
      }
    });
    return weeks;
  }, [tradeMap, days]);

  const handlePrevMonth = () => {
    if (animating) return;
    setAnimating(true);
    setCurrentMonth((prev) => prev.subtract(1, "month"));
    setTimeout(() => setAnimating(false), 400);
  };

  const handleNextMonth = () => {
    if (animating) return;
    setAnimating(true);
    setCurrentMonth((prev) => prev.add(1, "month"));
    setTimeout(() => setAnimating(false), 400);
  };

  const maxGain = Math.max(...Object.values(tradeMap.pnl).filter((v) => v > 0), 0);
  const maxLoss = Math.min(...Object.values(tradeMap.pnl).filter((v) => v < 0), 0);
  const today = dayjs().format("YYYY-MM-DD");

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200/60 p-5 shadow-none w-full h-[850px] flex flex-col">
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {currentMonth.format("MMMM YYYY")}
          </h2>
          <button onClick={handleNextMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3 relative">
          <span className={`text-lg font-semibold ${monthlyStats.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
            {monthlyStats.totalPnL >= 0 ? "+" : ""}${monthlyStats.totalPnL.toFixed(0)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {monthlyStats.tradingDays} days
          </span>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <Settings size={18} />
          </button>

          {showDropdown && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-10 right-0 w-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg p-4 z-50"
            >
              <div className="mb-2 font-bold text-gray-700 dark:text-white">Stats</div>
              <label className="flex justify-between items-center text-sm mb-2 text-gray-700 dark:text-gray-300">
                Show P&L <input type="checkbox" checked={showPnL} onChange={() => setShowPnL(!showPnL)} />
              </label>
              <label className="flex justify-between items-center text-sm mb-2 text-gray-700 dark:text-gray-300">
                Win Rate <input type="checkbox" checked={showWinRate} onChange={() => setShowWinRate(!showWinRate)} />
              </label>
              <label className="flex justify-between items-center text-sm mb-4 text-gray-700 dark:text-gray-300">
                Trades <input type="checkbox" checked={showTrades} onChange={() => setShowTrades(!showTrades)} />
              </label>
              <div className="mb-2 font-bold text-gray-700 dark:text-white">Visuals</div>
              <label className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
                Heatmap <input type="checkbox" checked={heatmapMode} onChange={() => setHeatmapMode(!heatmapMode)} />
              </label>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-4 items-start">
        {/* Calendar days */}
        <div className="flex-1">
          <div ref={headerRef} className="grid grid-cols-7 gap-1 text-sm text-center text-gray-500 dark:text-gray-400 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="font-medium p-2">{d}</div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentMonth.format("MM-YYYY")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="grid grid-cols-7 gap-1 text-sm text-gray-800 dark:text-white"
            >
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: rowHeight }} className="rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800" />
              ))}
              {days.map((date) => {
                const key = date.format("YYYY-MM-DD");
                const pnl = tradeMap.pnl[key];
                const tradesCount = tradeMap.tradesCount[key];
                const percentage = tradeMap.percentage[key];
                const isToday = key === today;
                const isPositive = pnl >= 0;

                const bgClass = pnl !== undefined
                  ? isPositive
                    ? "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-700"
                    : "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-700"
                  : "hover:bg-purple-100/60 dark:hover:bg-purple-900/30 border-transparent hover:border-purple-400 dark:hover:border-purple-600";

                return (
                  <div
                    key={key}
                    style={{ height: rowHeight }}
                    className={`relative rounded-md border ${bgClass}`}
                  >
                    <div className="absolute top-1 right-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <div className={`rounded-full w-5 h-5 flex items-center justify-center ${isToday ? "ring-2 ring-blue-500" : ""}`}>
                        {date.date()}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center h-full p-2 cursor-pointer hover:scale-[1.02] transition-transform duration-150">
                      {showPnL && pnl !== undefined && (
                        <span className={`text-xs font-semibold ${isPositive ? "text-green-700" : "text-red-700"}`}>
                          {isPositive ? "+" : ""}${pnl.toFixed(1)}
                        </span>
                      )}
                      {showWinRate && percentage !== 0 && (
                        <span className="text-xs text-gray-500">{percentage}%</span>
                      )}
                      {showTrades && tradesCount !== 0 && (
                        <span className="text-xs text-gray-400">{tradesCount} trades</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Weekly stats */}
        <motion.div
          key={currentMonth.format("MM-YYYY") + "-weeks"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="w-[150px] flex flex-col gap-1"
          style={{ marginTop: `${headerHeight + 11}px` }}
        >
          {weeklyStats.map((week, index) => (
            <div
              key={`week-${index}`}
              style={{ height: rowHeight }}
              className="bg-white dark:bg-zinc-800 rounded-md px-3 py-2 text-sm flex flex-col items-center justify-center border border-gray-200 dark:border-zinc-700"
            >
              <div className="text-gray-500 dark:text-gray-400">Week {index + 1}</div>
              <div className={`text-lg font-semibold ${week.weekPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                {week.weekPnL >= 0 ? "+" : ""}${week.weekPnL.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{week.tradingDays} days</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{week.totalTrades} trades</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarCard;
