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
  const [settings, setSettings] = useState({
    showDailyPnL: true,
    showWinRate: true,
    showTradesCount: true,
    colorIntensityMode: false,
  });

  const headerRef = useRef(null);
  const settingsRef = useRef(null);
  const settingsButtonRef = useRef(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("calendarSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("calendarSettings", JSON.stringify(settings));
  }, [settings]);

  // Measure header height for alignment
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  // Auto-close settings on outside click, but ignore clicks on the settings button
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target)
      ) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  const totalWeeks = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
  const rowHeight = 700 / totalWeeks;

  // Define tradeMap first
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

  // Define extremeDays after tradeMap
  const extremeDays = useMemo(() => {
    let mostProfit = { date: null, pnl: -Infinity };
    let mostLoss = { date: null, pnl: Infinity };

    Object.keys(tradeMap.pnl).forEach((date) => {
      if (dayjs(date).isSame(currentMonth, "month")) {
        const pnl = tradeMap.pnl[date];
        if (pnl > mostProfit.pnl) {
          mostProfit = { date, pnl };
        }
        if (pnl < mostLoss.pnl) {
          mostLoss = { date, pnl };
        }
      }
    });

    return { mostProfit: mostProfit.date, mostLoss: mostLoss.date };
  }, [tradeMap, currentMonth]);

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

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isToday = (date) => {
    return dayjs().isSame(date, "day");
  };

  return (
    <div className="bg-white dark:bg-[#0e0e10] rounded-2xl border ring-1 ring-gray-200 dark:ring-[#2c2c31] p-5 shadow-none w-full h-[850px] flex flex-col transition-none transform-none hover:scale-100 hover:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c31] transition-colors">
            <ChevronLeft size={18} className="text-gray-600 dark:text-[#f0f0f3]" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-[#f0f0f3]">
            {currentMonth.format("MMMM YYYY")}
          </h2>
          <button onClick={handleNextMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c31] transition-colors">
            <ChevronRight size={18} className="text-gray-600 dark:text-[#f0f0f3]" />
          </button>
          <button
            onClick={() => {
              if (!dayjs().isSame(currentMonth, "month")) {
                setAnimating(true);
                setCurrentMonth(dayjs());
                setTimeout(() => setAnimating(false), 400);
              }
            }}
            className="text-sm border ring-1 ring-gray-200 dark:ring-[#2c2c31] bg-gray-100 dark:bg-[#1c1c1f] text-gray-600 dark:text-[#9ca3af] px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2c2c31] transition-all duration-200"
          >
            Current month
          </button>
        </div>
        <div className="flex items-center gap-3 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMonth.format("MM-YYYY") + "-totalPnL"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`border px-3 py-1 rounded-lg shadow-sm ${
                monthlyStats.totalPnL >= 0
                  ? "border-green-300 dark:border-[#22c55e] bg-green-100/50 dark:bg-[#22c55e]/10 text-[#22c55e]"
                  : "border-red-300 dark:border-[#ef4444] bg-red-100/50 dark:bg-[#ef4444]/10 text-[#ef4444]"
              }`}
            >
              <span className="text-lg font-semibold">
                {monthlyStats.totalPnL >= 0 ? "+" : ""}${monthlyStats.totalPnL.toFixed(0)}
              </span>
            </motion.div>
          </AnimatePresence>
          <span className="text-sm text-gray-500 dark:text-[#9ca3af]">
            {monthlyStats.tradingDays} days
          </span>
          <button
            ref={settingsButtonRef}
            onClick={() => setSettingsOpen((prev) => !prev)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c31] transition-colors"
            title="Settings"
          >
            <Settings size={18} className="text-gray-600 dark:text-[#f0f0f3]" />
          </button>

          {/* Enhanced Settings Dropdown */}
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                ref={settingsRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut", type: "spring", stiffness: 300, damping: 20 }}
                className="absolute top-10 right-0 w-72 bg-gradient-to-br from-white to-gray-50 dark:bg-[#1c1c1f] rounded-lg shadow-xl p-6 z-50 border ring-1 ring-gray-200 dark:ring-[#2c2c31]"
              >
                <div className="text-sm text-gray-800 dark:text-[#f0f0f3]">
                  <h3 className="font-semibold text-lg mb-4 border-b border-gray-200 dark:border-[#2c2c31] pb-2 flex items-center">
                    <span className="text-gray-700 dark:text-[#9ca3af]">Stats</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <motion.label
                        htmlFor="showDailyPnL"
                        className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-[#f0f0f3] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Show Daily P&L</span>
                      </motion.label>
                      <label className="relative inline-block w-10 h-5 cursor-pointer">
                        <input
                          id="showDailyPnL"
                          type="checkbox"
                          checked={settings.showDailyPnL}
                          onChange={() => toggleSetting("showDailyPnL")}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <motion.div
                          className={`absolute top-0 left-0 w-10 h-5 rounded-full transition-colors duration-200 ${
                            settings.showDailyPnL
                              ? "bg-blue-500"
                              : "bg-gray-300 dark:bg-[#2c2c31]"
                          }`}
                        />
                        <motion.div
                          className="absolute top-0.5 w-4 h-4 bg-white dark:bg-[#f0f0f3] rounded-full shadow-sm"
                          animate={{
                            x: settings.showDailyPnL ? 22 : 2,
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <motion.label
                        htmlFor="showWinRate"
                        className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-[#f0f0f3] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Show Day Win Rate</span>
                      </motion.label>
                      <label className="relative inline-block w-10 h-5 cursor-pointer">
                        <input
                          id="showWinRate"
                          type="checkbox"
                          checked={settings.showWinRate}
                          onChange={() => toggleSetting("showWinRate")}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <motion.div
                          className={`absolute top-0 left-0 w-10 h-5 rounded-full transition-colors duration-200 ${
                            settings.showWinRate
                              ? "bg-blue-500"
                              : "bg-gray-300 dark:bg-[#2c2c31]"
                          }`}
                        />
                        <motion.div
                          className="absolute top-0.5 w-4 h-4 bg-white dark:bg-[#f0f0f3] rounded-full shadow-sm"
                          animate={{
                            x: settings.showWinRate ? 22 : 2,
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <motion.label
                        htmlFor="showTradesCount"
                        className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-[#f0f0f3] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Show Number of Trades</span>
                      </motion.label>
                      <label className="relative inline-block w-10 h-5 cursor-pointer">
                        <input
                          id="showTradesCount"
                          type="checkbox"
                          checked={settings.showTradesCount}
                          onChange={() => toggleSetting("showTradesCount")}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <motion.div
                          className={`absolute top-0 left-0 w-10 h-5 rounded-full transition-colors duration-200 ${
                            settings.showTradesCount
                              ? "bg-blue-500"
                              : "bg-gray-300 dark:bg-[#2c2c31]"
                          }`}
                        />
                        <motion.div
                          className="absolute top-0.5 w-4 h-4 bg-white dark:bg-[#f0f0f3] rounded-full shadow-sm"
                          animate={{
                            x: settings.showTradesCount ? 22 : 2,
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                      </label>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mt-6 mb-4 border-b border-gray-200 dark:border-[#2c2c31] pb-2 flex items-center">
                    <span className="text-gray-700 dark:text-[#9ca3af]">Visuals</span>
                  </h3>
                  <div className="flex items-center justify-between">
                    <motion.label
                      htmlFor="colorIntensityMode"
                      className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-[#f0f0f3] transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Color Intensity Mode</span>
                    </motion.label>
                    <label className="relative inline-block w-10 h-5 cursor-pointer">
                      <input
                        id="colorIntensityMode"
                        type="checkbox"
                        checked={settings.colorIntensityMode}
                        onChange={() => toggleSetting("colorIntensityMode")}
                        className="absolute opacity-0 w-0 h-0"
                      />
                      <motion.div
                        className={`absolute top-0 left-0 w-10 h-5 rounded-full transition-colors duration-200 ${
                          settings.colorIntensityMode
                            ? "bg-blue-500"
                            : "bg-gray-300 dark:bg-[#2c2c31]"
                        }`}
                      />
                      <motion.div
                        className="absolute top-0.5 w-4 h-4 bg-white dark:bg-[#f0f0f3] rounded-full shadow-sm"
                        animate={{
                          x: settings.colorIntensityMode ? 22 : 2,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-1 gap-4 items-start">
        {/* Calendar Days */}
        <div className="flex-1">
          <div
            ref={headerRef}
            className="grid grid-cols-7 gap-1 text-sm text-center text-gray-700 dark:text-[#9ca3af] mb-3"
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="border ring-1 ring-gray-300 dark:ring-[#2c2c31] rounded-md py-1 font-medium bg-white dark:bg-[#1c1c1f]"
              >
                {d}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentMonth.format("MM-YYYY")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="grid grid-cols-7 gap-1 text-sm text-gray-800 dark:text-[#f0f0f3]"
            >
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{ height: rowHeight }}
                  className="rounded-md border ring-1 ring-gray-200 dark:ring-[#2c2c31] bg-gray-50 dark:bg-[#1c1c1f]"
                />
              ))}
              {days.map((date) => {
                const key = date.format("YYYY-MM-DD");
                const pnl = tradeMap.pnl[key];
                const tradesCount = tradeMap.tradesCount[key];
                const percentage = tradeMap.percentage[key];
                const tooltipId = `tooltip-${key}`;
                const isExtremeDay =
                  settings.colorIntensityMode &&
                  (key === extremeDays.mostProfit || key === extremeDays.mostLoss);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={key}
                    style={{ height: rowHeight }}
                    className={`rounded-md border ring-1 ${
                      pnl !== undefined
                        ? pnl >= 0
                          ? isExtremeDay
                            ? "ring-green-500 dark:ring-[#22c55e]"
                            : "ring-green-400 dark:ring-[#22c55e]"
                          : isExtremeDay
                          ? "ring-red-400 dark:ring-[#ef4444]"
                          : "ring-red-300 dark:ring-[#ef4444]"
                        : "ring-gray-200 dark:ring-[#2c2c31]"
                    } bg-gray-50 dark:bg-[#1c1c1f] ${
                      isTodayDate ? "outline outline-2 outline-accent/50 rounded-xl" : ""
                    }`}
                  >
                    <div
                      data-tooltip-id={tooltipId}
                      data-tooltip-content={
                        pnl !== undefined
                          ? `${key}: ${pnl < 0 ? "-" : ""}$${Math.abs(pnl).toFixed(2)} | Trades: ${tradesCount}`
                          : null
                      }
                      className={`relative w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 p-2
                        ${
                          pnl !== undefined
                            ? pnl >= 0
                              ? isExtremeDay
                                ? "bg-[#22c55e]/10 dark:bg-[#22c55e]/10 hover:bg-[#2c2c31] hover:shadow-[0_0_4px_#22c55e33] ring-green-500 dark:ring-[#22c55e]"
                                : "bg-[#22c55e]/10 dark:bg-[#22c55e]/10 hover:bg-[#2c2c31] hover:shadow-[0_0_4px_#22c55e33] ring-green-400 dark:ring-[#22c55e]"
                              : isExtremeDay
                              ? "bg-[#ef4444]/10 dark:bg-[#ef4444]/10 hover:bg-[#2c2c31] hover:shadow-[0_0_4px_#ef444433] ring-red-500 dark:ring-[#ef4444]"
                              : "bg-[#ef4444]/10 dark:bg-[#ef4444]/10 hover:bg-[#2c2c31] hover:shadow-[0_0_4px_#ef444433] ring-red-400 dark:ring-[#ef4444]"
                            : "hover:bg-[#2c2c31] ring-gray-200 dark:ring-[#2c2c31]"
                        }`}
                    >
                      <span className="absolute top-1 right-2 text-xs font-semibold text-gray-600 dark:text-[#9ca3af]">
                        {date.date()}
                      </span>
                      {pnl !== undefined && (
                        <>
                          {settings.showDailyPnL && (
                            <span className={`text-sm font-semibold ${pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(1)}
                            </span>
                          )}
                          {settings.showWinRate && (
                            <span className="text-xs text-gray-500 dark:text-[#9ca3af]">{percentage}%</span>
                          )}
                          {settings.showTradesCount && (
                            <span className="text-xs text-gray-400 dark:text-[#9ca3af]">{tradesCount} trades</span>
                          )}
                        </>
                      )}
                    </div>
                    {pnl !== undefined && (
                      <ReactTooltip
                        id={tooltipId}
                        place="top"
                        className="z-[1000] text-xs px-2 py-1 rounded shadow-lg bg-gray-900 dark:bg-[#1c1c1f] text-white dark:text-[#f0f0f3]"
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Weekly Stats with animation */}
        <AnimatePresence mode="wait">
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
                className="bg-white dark:bg-[#1c1c1f] rounded-md px-3 py-2 text-sm flex flex-col items-center justify-center border ring-1 ring-gray-200 dark:ring-[#2c2c31]"
              >
                <div className="text-gray-500 dark:text-[#9ca3af]">Week {index + 1}</div>
                <div className={`text-lg font-semibold ${week.weekPnL >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  {week.weekPnL >= 0 ? "+" : ""}${week.weekPnL.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-[#9ca3af]">{week.tradingDays} days</div>
                <div className="text-xs text-gray-500 dark:text-[#9ca3af]">{week.totalTrades} trades</div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarCard;
