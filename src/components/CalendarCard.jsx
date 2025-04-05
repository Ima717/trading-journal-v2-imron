import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import dayjs from "dayjs";
import { Tooltip as ReactTooltip } from "react-tooltip";

const CalendarCard = ({ trades = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [animating, setAnimating] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [showPnl, setShowPnl] = useState(true);
  const [showWinRate, setShowWinRate] = useState(false);
  const [showTrades, setShowTrades] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState(false);

  const headerRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);

    const saved = JSON.parse(localStorage.getItem("calendarSettings"));
    if (saved) {
      setShowPnl(saved.showPnl);
      setShowWinRate(saved.showWinRate);
      setShowTrades(saved.showTrades);
      setHeatmapMode(saved.heatmapMode);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "calendarSettings",
      JSON.stringify({ showPnl, showWinRate, showTrades, heatmapMode })
    );
  }, [showPnl, showWinRate, showTrades, heatmapMode]);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

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

  const maxPnl = Math.max(...Object.values(tradeMap.pnl));
  const minPnl = Math.min(...Object.values(tradeMap.pnl));

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

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200/60 p-5 shadow-none w-full h-[850px] flex flex-col transition-none transform-none hover:scale-100 hover:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth}><ChevronLeft size={18} /></button>
          <h2 className="text-lg font-semibold">{currentMonth.format("MMMM YYYY")}</h2>
          <button onClick={handleNextMonth}><ChevronRight size={18} /></button>
          <button onClick={() => setCurrentMonth(dayjs())} className="text-sm text-gray-500">This month</button>
        </div>
        <div className="relative" ref={settingsRef}>
          <button onClick={() => setSettingsOpen((prev) => !prev)}><Settings size={18} /></button>
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg shadow-lg p-4 z-50"
              >
                <div className="mb-2">
                  <div className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-200">Stats</div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">
                    <input type="checkbox" checked={showPnl} onChange={() => setShowPnl(!showPnl)} className="mr-2" /> Show Daily P&L
                  </label>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">
                    <input type="checkbox" checked={showWinRate} onChange={() => setShowWinRate(!showWinRate)} className="mr-2" /> Show Win Rate
                  </label>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">
                    <input type="checkbox" checked={showTrades} onChange={() => setShowTrades(!showTrades)} className="mr-2" /> Show Trade Count
                  </label>
                </div>
                <div>
                  <div className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-200">Visuals</div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">
                    <input type="checkbox" checked={heatmapMode} onChange={() => setHeatmapMode(!heatmapMode)} className="mr-2" /> Color Intensity Mode
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm text-center text-gray-500 dark:text-gray-400 mb-3" ref={headerRef}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-medium p-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm text-gray-800 dark:text-white">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} style={{ height: rowHeight }} className="rounded-md border bg-transparent" />
        ))}

        {days.map((date) => {
          const key = date.format("YYYY-MM-DD");
          const pnl = tradeMap.pnl[key];
          const tradesCount = tradeMap.tradesCount[key];
          const percentage = tradeMap.percentage[key];
          const isToday = date.isSame(dayjs(), "day");

          const bgStyle = heatmapMode && pnl !== undefined
            ? pnl > 0
              ? "bg-green-200/60"
              : "bg-red-200/60"
            : "";

          return (
            <div key={key} style={{ height: rowHeight }} className={`relative rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 ${isToday ? "ring-2 ring-purple-400" : ""} ${bgStyle}`}>
              <div className="absolute top-1 right-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                {date.date()}
              </div>
              <div className="w-full h-full flex flex-col items-center justify-center px-1 pt-5">
                {showPnl && pnl !== undefined && (
                  <span className={`text-xs font-semibold ${pnl >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(1)}
                  </span>
                )}
                {showWinRate && percentage !== undefined && (
                  <span className="text-xs text-gray-500">{percentage}%</span>
                )}
                {showTrades && tradesCount !== undefined && (
                  <span className="text-xs text-gray-400">{tradesCount} trades</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarCard;
