import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings, ArrowUp, ArrowDown } from "lucide-react";
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
  const [highlightedDays, setHighlightedDays] = useState([]); // For "Highlight Similar Days"

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
    // Simulate a toast notification
    console.log("Settings Applied");
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

  const resetSettings = () => {
    setSettings({
      showDailyPnL: true,
      showWinRate: true,
      showTradesCount: true,
      colorIntensityMode: false,
    });
  };

  const isToday = (date) => {
    return dayjs().isSame(date, "day");
  };

  const handleHighlightSimilarDays = (pnl) => {
    const similarDays = Object.keys(tradeMap.pnl).filter((date) => {
      const dayPnl = tradeMap.pnl[date];
      return Math.abs(dayPnl - pnl) < 50 && dayjs(date).isSame(currentMonth, "month");
    });
    setHighlightedDays(similarDays);
  };

  const handleCompareMonths = () => {
    console.log("Compare Months feature: To be implemented");
  };

  return (
    <div className="bg-white dark:bg-[#0e0e10] rounded-2xl border ring-1 ring-gray-200 dark:ring-[#2c2c31] p-5 shadow-none w-full h-[850px] flex flex-col transition-none transform-none hover:scale-100 hover:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            onKeyDown={(e) => e.key === "Enter" && handlePrevMonth()}
            aria-label="Previous month"
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c31] transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-[#f0f0f3]" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-[#f0f0f3]">
            {currentMonth.format("MMMM YYYY")}
          </h2>
          <button
            onClick={handleNextMonth}
            onKeyDown={(e) => e.key === "Enter" && handleNextMonth()}
            aria-label="Next month"
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c31] transition-colors"
          >
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
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !dayjs().isSame(currentMonth, "month") &&
              setCurrentMonth(dayjs())
            }
            aria-label="Go to current month"
            className="text-sm border ring-1 ring-gray-200 dark:ring-[#2c2c31] bg-gray-100 dark:bg-[#1c1c1f] text-gray-600 dark:text-[#9ca3af] px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2c2c31] transition-all duration-200"
          >
            Current month
          </button>
          <button
            onClick={handleCompareMonths}
            onKeyDown={(e) => e.key === "Enter" && handleCompareMonths()}
            aria-label="Compare months"
            className="text-sm border ring-1 ring-gray-200 dark:ring-[#2c2c31] bg-gray-100 dark:bg-[#1c1c1f] text-gray-600 dark:text-[#9ca3af] px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2c2c31] transition-all duration-200"
          >
            Compare Months
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
                  ? "border-[#10b981] dark:border-[#10b981] bg-[#10b981]/10 dark:bg-[#10b981]/10 text-[#10b981]"
                  : "border-[#f87171] dark:border-[#f87171] bg-[#f87171]/10 dark:bg-[#f87171]/10 text-[#f87171]"
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
            onKeyDown={(e) => e.key === "Enter" && setSettingsOpen((prev) => !prev)}
            aria-label="Open settings"
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c31] transition-colors"
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
                        data-tooltip-id="tooltip-showDailyPnL"
                        data-tooltip-content="Show the daily profit/loss in each cell"
                      >
                        <span>Show Daily P&L</span>
                      </motion.label>
                      <label className="relative inline-block w-10 h-5 cursor-pointer">
                        <input
                          id="showDailyPnL"
                          type="checkbox"
                          checked={settings.showDailyPnL}
                          onChange={() => toggleSetting("showDailyPnL")}
                          onKeyDown={(e) => e.key === "Enter" && toggleSetting("showDailyPnL")}
                          className="absolute opacity-0 w-0 h-0"
                          aria-label="Toggle Show Daily P&L"
                        />
                        <motion.div
                          className={`absolute top-0 left-0 w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
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
                      <ReactTooltip
                        id="tooltip-showDailyPnL"
                        place="top"
                        className="z-[1000] text-xs px-2 py-1 rounded shadow-lg bg-gray-900 dark:bg-[#1c1c1f] text-white dark:text-[#f0f0f3]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <motion.label
                        htmlFor="showWinRate"
                        className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-[#f0f0f3] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        data-tooltip-id="tooltip-showWinRate"
                        data-tooltip-content="Show the win rate percentage in each cell"
                      >
                        <span>Show Day Win Rate</span>
                      </motion.label>
                      <label className="relative inline-block w-10 h-5 cursor-pointer">
                        <input
                          id="showWinRate"
                          type="checkbox"
                          checked={settings.showWinRate}
                          onChange={() => toggleSetting("showWinRate")}
                          onKeyDown={(e) => e.key === "Enter" && toggleSetting("showWinRate")}
                          className="absolute opacity-0 w-0 h-0"
                          aria-label="Toggle Show Day Win Rate"
                        />
                        <motion.div
                          className={`absolute top-0 left-0 w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
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
                      <ReactTooltip
                        id="tooltip-showWinRate"
                        place="top"
                        className="z-[1000] text-xs px-2 py-1 rounded shadow-lg bg-gray-900 dark:bg-[#1c1c1f] text-white dark:text-[#f0f0f3]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <motion.label
                        htmlFor="showTradesCount"
                        className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-[#f0f0f3] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        data-tooltip-id="tooltip-showTradesCount"
                        data-tooltip-content="Show the number of trades in each cell"
                      >
                        <span>Show Number of Trades</span>
                      </motion.label>
                      <label className="relative inline-block w-10 h-5 cursor-pointer">
                        <input
                          id="showTradesCount"
                          type="checkbox"
                          checked={settings.showTradesCount}
                          onChange={() => toggleSetting("showTradesCount")}
                          onKeyDown={(e) => e.key === "Enter" && toggleSetting("showTradesCount")}
                          className="absolute opacity-0 w-0 h-0"
                          aria-label="Toggle Show Number of Trades"
                        />
                        <motion.div
                          className={`absolute top-0 left-0 w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
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
                      <ReactTooltip
                        id="tooltip-showTradesCount"
                        place="top"
                        className="z-[1000] text-xs px-2 py-1 rounded shadow-lg bg-gray-900 dark:bg-[#1c1c1f] text-white dark:text-[#f0f0f3]"
                      />
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
                      data-tooltip-id="tooltip-colorIntensityMode"
                      data-tooltip-content="Highlight the most profitable and loss-making days with deeper colors"
                    >
                      <span>Color Intensity Mode</span>
                    </motion.label>
                    <label className="relative inline-block w-10 h-5 cursor-pointer">
                      <input
                        id="colorIntensityMode"
                        type="checkbox"
                        checked={settings.colorIntensityMode}
                        onChange={() => toggleSetting("colorIntensityMode")}
                        onKeyDown={(e) => e.key === "Enter" && toggleSetting("colorIntensityMode")}
                        className="absolute opacity-0 w-0 h-0"
                        aria-label="Toggle Color Intensity Mode"
                      />
                      <motion.div
                        className={`absolute top-0 left-0 w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
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
                    <ReactTooltip
                      id="tooltip-colorIntensityMode"
                      place="top"
                      className="z-[1000] text-xs px-2 py-1 rounded shadow-lg bg-gray-900 dark:bg-[#1c1c1f] text-white dark:text-[#f0f0f3]"
                    />
                  </div>
                  <button
                    onClick={resetSettings}
                    onKeyDown={(e) => e.key === "Enter" && resetSettings()}
                    aria-label="Reset settings to default"
                    className="mt-4 w-full text-sm border ring-1 ring-gray-200 dark:ring-[#2c2c31] bg-gray-100 dark:bg-[#1c1c1f] text-gray-600 dark:text-[#9ca3af] px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2c2c31] transition-all duration-200"
                  >
                    Reset to Default
                  </button>
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
            className="grid grid-cols-7 gap-2 text-sm text-center text-gray-700 dark:text-[#9ca3af] mb-3"
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
              className="grid grid-cols-7 gap-2 text-sm text-gray-800 dark:text-[#f0f0f3]"
            >
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <motion.div
                  key={`empty-${i}`}
                  style={{ height: rowHeight }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="rounded-md border ring-1 ring-gray-200 dark:ring-[#2c2c31] bg-[#f3f4f6] dark:bg-[#2d2d2d] shadow-sm"
                />
              ))}
              {days.map((date, index) => {
                const key = date.format("YYYY-MM-DD");
                const pnl = tradeMap.pnl[key];
                const tradesCount = tradeMap.tradesCount[key];
                const percentage = tradeMap.percentage[key];
                const tooltipId = `tooltip-${key}`;
                const isExtremeDay =
                  settings.colorIntensityMode &&
                  (key === extremeDays.mostProfit || key === extremeDays.mostLoss);
                const isTodayDate = isToday(date);
                const isHighlighted = highlightedDays.includes(key);
                const isLastDayOfWeek = (index + firstDayOfWeek + 1) % 7 === 0;

                return (
                  <motion.div
                    key={key}
                    style={{ height: rowHeight }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={`rounded-md border ring-1 shadow-sm ${
                      isLastDayOfWeek ? "border-b-2 border-gray-300 dark:border-[#2c2c31]" : ""
                    } ${
                      pnl !== undefined
                        ? pnl >= 0
                          ? isExtremeDay
                            ? "ring-[#10b981] dark:ring-[#10b981]"
                            : "ring-[#10b981] dark:ring-[#10b981]"
                          : isExtremeDay
                          ? "ring-[#f87171] dark:ring-[#f87171]"
                          : "ring-[#f87171] dark:ring-[#f87171]"
                        : "ring-gray-200 dark:ring-[#2c2c31]"
                    } bg-gray-50 dark:bg-[#1c1c1f] ${
                      isTodayDate ? "outline outline-2 outline-[#10b981]/50 rounded-xl" : ""
                    } ${isHighlighted ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}
                  >
                    <div
                      data-tooltip-id={tooltipId}
                      data-tooltip-content={
                        pnl !== undefined
                          ? `Date: ${key}\nP&L: ${pnl < 0 ? "-" : ""}$${Math.abs(pnl).toFixed(2)}\nTrades: ${tradesCount}`
                          : null
                      }
                      onClick={() => pnl !== undefined && handleHighlightSimilarDays(pnl)}
                      className={`relative w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 p-4
                        ${
                          pnl !== undefined
                            ? pnl >= 0
                              ? isExtremeDay
                                ? "bg-[#10b981]/10 dark:bg-[#10b981]/10 hover:bg-[#2c2c31] hover:shadow-[0_0_4px_#10b98133] ring-[#10b981] dark:ring-[#10b981]"
                                : "bg-[#10b981]/10 dark:bg-[#10b981]/10 hover:bg-[#2c2c31] hover:shadow-[0_0_4px_#10b98133] ring-[#10b981] dark:ring-[#10b981]"
                              : isExtremeDay
                              ? "bg-[#f87171]/10 dark:bg-[#f87171]/10 hover:bg-[#2c2c31] hover:shadow-[0_0_4px_#f8717133] ring-[#f87171] dark:ring-[#f87171]"
                              : "bg-[#f87171]/10 dark:bg-[#f87171]/10 hover:bg-[#2c2c31] hover:shadow-[0_0_4px_#f8717133] ring-[#f87171] dark:ring-[#f87171]"
                            : "hover:bg-[#2c2c31] ring-gray-200 dark:ring-[#2c2c31]"
                        } hover:scale-105`}
                    >
                      <span className="absolute top-2 right-2 text-base font-semibold text-gray-600 dark:text-[#9ca3af]">
                        {date.date()}
                      </span>
                      {pnl !== undefined && (
                        <div className="flex flex-col items-center space-y-1">
                          {settings.showDailyPnL && (
                            <div className="flex items-center space-x-1">
                              {pnl >= 0 ? (
                                <ArrowUp size={14} className="text-[#10b981]" />
                              ) : (
                                <ArrowDown size={14} className="text-[#f87171]" />
                              )}
                              <span className={`text-sm font-bold font-mono ${pnl >= 0 ? "text-[#10b981]" : "text-[#f87171]"}`}>
                                {pnl >= 0 ? "+" : ""}${pnl.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {settings.showWinRate && (
                            <span className="text-xs font-medium text-gray-500 dark:text-[#9ca3af]">{percentage}%</span>
                          )}
                          {settings.showTradesCount && (
                            <span className="text-xs font-medium text-gray-400 dark:text-[#9ca3af]">{tradesCount} trades</span>
                          )}
                          {/* Mini Sparkline (simulated with a gradient bar) */}
                          {tradesCount > 1 && (
                            <div className="w-12 h-2 bg-gradient-to-r from-[#10b981] to-[#f87171] rounded-full opacity-50"></div>
                          )}
                        </div>
                      )}
                    </div>
                    {pnl !== undefined && (
                      <ReactTooltip
                        id={tooltipId}
                        place="top"
                        className="z-[1000] text-xs px-2 py-1 rounded shadow-lg bg-gray-900 dark:bg-[#1c1c1f] text-white dark:text-[#f0f0f3]"
                      />
                    )}
                  </motion.div>
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
            className="w-[150px] flex flex-col gap-2"
            style={{ marginTop: `${headerHeight + 11}px` }}
          >
            {weeklyStats.map((week, index) => (
              <div
                key={`week-${index}`}
                style={{ height: rowHeight }}
                className="bg-white dark:bg-[#1c1c1f] rounded-md px-3 py-2 text-sm flex flex-col items-center justify-center border ring-1 ring-gray-200 dark:ring-[#2c2c31] shadow-sm"
              >
                <div className="text-gray-500 dark:text-[#9ca3af] font-medium">Week {index + 1}</div>
                <div className={`text-lg font-bold ${week.weekPnL >= 0 ? "text-[#10b981]" : "text-[#f87171]"}`}>
                  {week.weekPnL >= 0 ? "+" : ""}${week.weekPnL.toFixed(1)}
                </div>
                <div className="text-xs font-medium text-gray-500 dark:text-[#9ca3af]">{week.tradingDays} days</div>
                <div className="text-xs font-medium text-gray-400 dark:text-[#9ca3af]">{week.totalTrades} trades</div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarCard;
