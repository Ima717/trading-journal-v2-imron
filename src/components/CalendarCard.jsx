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
  const settingsRef = useRef(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showPnl, setShowPnl] = useState(() => JSON.parse(localStorage.getItem("showPnl")) ?? true);
  const [showWinRate, setShowWinRate] = useState(() => JSON.parse(localStorage.getItem("showWinRate")) ?? false);
  const [showTrades, setShowTrades] = useState(() => JSON.parse(localStorage.getItem("showTrades")) ?? false);
  const [heatmap, setHeatmap] = useState(() => JSON.parse(localStorage.getItem("heatmap")) ?? false);

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  useEffect(() => {
    localStorage.setItem("showPnl", showPnl);
    localStorage.setItem("showWinRate", showWinRate);
    localStorage.setItem("showTrades", showTrades);
    localStorage.setItem("heatmap", heatmap);
  }, [showPnl, showWinRate, showTrades, heatmap]);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  const totalWeeks = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
  const rowHeight = 700 / totalWeeks;
  const today = dayjs().format("YYYY-MM-DD");

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

  const maxPnL = Math.max(...Object.values(tradeMap.pnl), 1);
  const minPnL = Math.min(...Object.values(tradeMap.pnl), -1);

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

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200/60 p-5 shadow-none w-full h-[850px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{currentMonth.format("MMMM YYYY")}</h2>
          <button onClick={handleNextMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700">
            <ChevronRight size={18} />
          </button>
          <button className="text-sm text-gray-500 dark:text-gray-400">This month</button>
        </div>
        <div className="relative" ref={settingsRef}>
          <button onClick={() => setSettingsOpen((prev) => !prev)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700">
            <Settings size={18} />
          </button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-60 z-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg p-3 text-sm">
              <div className="mb-3">
                <div className="text-xs font-bold uppercase text-gray-500">Stats</div>
                <label className="block mt-2"><input type="checkbox" checked={showPnl} onChange={() => setShowPnl(!showPnl)} className="mr-2" /> Daily PnL</label>
                <label className="block"><input type="checkbox" checked={showWinRate} onChange={() => setShowWinRate(!showWinRate)} className="mr-2" /> Win Rate</label>
                <label className="block"><input type="checkbox" checked={showTrades} onChange={() => setShowTrades(!showTrades)} className="mr-2" /> Number of Trades</label>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-gray-500">Visuals</div>
                <label className="block mt-2"><input type="checkbox" checked={heatmap} onChange={() => setHeatmap(!heatmap)} className="mr-2" /> Color Intensity</label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
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
              transition={{ duration: 0.2 }}
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

                let bg = pnl >= 0 ? "bg-green-200/50" : "bg-red-200/50";
                if (heatmap && pnl !== undefined) {
                  const alpha = Math.min(Math.abs(pnl) / Math.max(Math.abs(maxPnL), Math.abs(minPnL)), 1);
                  bg = pnl >= 0
                    ? `bg-green-500/(${Math.round(alpha * 100)})`
                    : `bg-red-500/(${Math.round(alpha * 100)})`;
                }

                return (
                  <div
                    key={key}
                    style={{ height: rowHeight }}
                    className={`relative rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 ${isToday ? "ring-2 ring-blue-400 dark:ring-blue-300" : ""}`}
                  >
                    <span className="absolute top-1 right-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {date.date()}
                    </span>
                    {pnl !== undefined && (
                      <div className={`w-full h-full flex flex-col items-center justify-center text-center text-xs ${bg}`}>
                        {showPnl && (
                          <span className={`font-bold ${pnl >= 0 ? "text-green-700" : "text-red-700"}`}>
                            {pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toFixed(1)}
                          </span>
                        )}
                        {showWinRate && <span className="text-gray-500">{percentage}%</span>}
                        {showTrades && <span className="text-gray-400">{tradesCount} trades</span>}
                      </div>
                    )}
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
          transition={{ duration: 0.2 }}
          className="w-[150px] flex flex-col gap-1"
          style={{ marginTop: `${headerHeight + 11}px` }}
        >
          {weeklyStats.map((week, index) => (
            <div key={`week-${index}`} style={{ height: rowHeight }} className="bg-white dark:bg-zinc-800 rounded-md px-3 py-2 text-sm flex flex-col items-center justify-center border border-gray-200 dark:border-zinc-700">
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
