import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings, Check } from "lucide-react";
import dayjs from "dayjs";
import { Tooltip as ReactTooltip } from "react-tooltip";

const CalendarCard = ({ trades = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [animating, setAnimating] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const settingsRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  const [showPnL, setShowPnL] = useState(() => JSON.parse(localStorage.getItem("showPnL")) ?? true);
  const [showWinRate, setShowWinRate] = useState(() => JSON.parse(localStorage.getItem("showWinRate")) ?? true);
  const [showTradeCount, setShowTradeCount] = useState(() => JSON.parse(localStorage.getItem("showTradeCount")) ?? true);
  const [enableHeatmap, setEnableHeatmap] = useState(() => JSON.parse(localStorage.getItem("enableHeatmap")) ?? true);

  const today = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem("showPnL", showPnL);
    localStorage.setItem("showWinRate", showWinRate);
    localStorage.setItem("showTradeCount", showTradeCount);
    localStorage.setItem("enableHeatmap", enableHeatmap);
  }, [showPnL, showWinRate, showTradeCount, enableHeatmap]);

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
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
    let totalPnL = 0, tradingDays = 0, totalTrades = 0;
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
    const weeks = [], currentWeek = [];
    days.forEach((day, index) => {
      currentWeek.push(day);
      if (day.day() === 6 || index === days.length - 1) {
        const weekPnL = currentWeek.reduce((sum, d) => sum + (tradeMap.pnl[d.format("YYYY-MM-DD")] || 0), 0);
        const tradingDays = currentWeek.filter((d) => tradeMap.pnl[d.format("YYYY-MM-DD")]).length;
        const totalTrades = currentWeek.reduce((sum, d) => sum + (tradeMap.tradesCount[d.format("YYYY-MM-DD")] || 0), 0);
        weeks.push({ weekPnL, tradingDays, totalTrades });
        currentWeek.length = 0;
      }
    });
    return weeks;
  }, [tradeMap, days]);

  const maxPnL = useMemo(() => Math.max(...Object.values(tradeMap.pnl).filter(v => v > 0), 0), [tradeMap]);
  const maxLoss = useMemo(() => Math.min(...Object.values(tradeMap.pnl).filter(v => v < 0), 0), [tradeMap]);

  const getHeatmapStyle = (pnl) => {
    if (!enableHeatmap || pnl === undefined) return "";
    if (pnl > 0) {
      const intensity = Math.min(pnl / maxPnL, 1);
      return `border-[2px] border-green-500/[${
        Math.round(intensity * 100)
      }]`;
    } else if (pnl < 0) {
      const intensity = Math.min(Math.abs(pnl) / Math.abs(maxLoss), 1);
      return `border-[2px] border-red-500/[${
        Math.round(intensity * 100)
      }]`;
    }
    return "";
  };

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

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200/60 p-5 w-full h-[850px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
        <div className="relative">
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            onClick={() => setShowSettings((prev) => !prev)}
          >
            <Settings size={18} />
          </button>
          <AnimatePresence>
            {showSettings && (
              <motion.div
                ref={settingsRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-50 mt-2 w-56 bg-white dark:bg-zinc-700 rounded-xl shadow-lg p-4 space-y-4 text-sm border border-gray-200 dark:border-zinc-600"
              >
                <div>
                  <p className="font-semibold text-gray-700 dark:text-white mb-2">Stats</p>
                  <div className="space-y-2">
                    <SettingToggle label="Show Daily P&L" value={showPnL} onChange={setShowPnL} />
                    <SettingToggle label="Show Win Rate" value={showWinRate} onChange={setShowWinRate} />
                    <SettingToggle label="Number of Trades" value={showTradeCount} onChange={setShowTradeCount} />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-white mb-2">Visuals</p>
                  <SettingToggle label="Color Intensity Mode" value={enableHeatmap} onChange={setEnableHeatmap} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Calendar Days */}
      <div className="flex flex-1 gap-4 items-start">
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
                <div key={`empty-${i}`} style={{ height: rowHeight }} className="rounded-md bg-gray-50 dark:bg-zinc-800" />
              ))}
              {days.map((date) => {
                const key = date.format("YYYY-MM-DD");
                const pnl = tradeMap.pnl[key];
                const tradesCount = tradeMap.tradesCount[key];
                const percentage = tradeMap.percentage[key];
                const isToday = key === today;

                return (
                  <div key={key} style={{ height: rowHeight }} className="relative rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`relative w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 transition-colors duration-200
                      ${pnl !== undefined
                        ? pnl >= 0
                          ? "bg-green-100/50 dark:bg-green-900/30"
                          : "bg-red-100/50 dark:bg-red-900/30"
                        : "hover:bg-purple-100/40 dark:hover:bg-purple-900/30"}
                      ${getHeatmapStyle(pnl)} 
                      ${isToday ? "ring-2 ring-blue-400/80 rounded-md" : ""}`}
                    >
                      <span className="absolute top-1 right-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {date.date()}
                      </span>
                      {pnl !== undefined && (
                        <>
                          {showPnL && (
                            <span className={`text-xs font-semibold ${pnl >= 0 ? "text-green-700" : "text-red-700"}`}>
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(1)}
                            </span>
                          )}
                          {showWinRate && (
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          )}
                          {showTradeCount && (
                            <span className="text-xs text-gray-400">{tradesCount} trades</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Weekly Stats */}
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

// Toggle Switch Component
const SettingToggle = ({ label, value, onChange }) => (
  <button
    className="w-full flex items-center justify-between px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
    onClick={() => onChange(!value)}
  >
    <span>{label}</span>
    {value && <Check size={16} className="text-green-500" />}
  </button>
);

export default CalendarCard;
