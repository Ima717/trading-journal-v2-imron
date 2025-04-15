// src/components/CalendarCard.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import dayjs from "dayjs";
import { Tooltip as ReactTooltip } from "react-tooltip";
import DailyTradeModal from "./DailyTradeModal"; // Import the new modal component

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const headerRef = useRef(null);
  const settingsRef = useRef(null);
  const settingsButtonRef = useRef(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("calendarSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("calendarSettings", JSON.stringify(settings));
  }, [settings]);

  // Measure header height for alignment
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  // Close settings dropdown on click outside
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

  // Handle keyboard navigation for date selection
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isModalOpen) return;

      if (event.key === "Escape") {
        setIsModalOpen(false);
        setSelectedDate(null);
      } else if (event.key === "ArrowLeft" && selectedDate) {
        const prevDay = dayjs(selectedDate).subtract(1, "day");
        setSelectedDate(prevDay);
        if (!prevDay.isSame(currentMonth, "month")) {
          setCurrentMonth(prevDay);
        }
      } else if (event.key === "ArrowRight" && selectedDate) {
        const nextDay = dayjs(selectedDate).add(1, "day");
        setSelectedDate(nextDay);
        if (!nextDay.isSame(currentMonth, "month")) {
          setCurrentMonth(nextDay);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, selectedDate, currentMonth]);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  const totalWeeks = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
  const rowHeight = 700 / totalWeeks;

  // Map trades to dates
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

  const formatPnL = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000) {
      const kValue = (absValue / 1000).toFixed(1);
      return `${value >= 0 ? "+" : "-"}$${kValue.endsWith(".0") ? kValue.slice(0, -2) : kValue}k`;
    }
    if (Number.isInteger(absValue)) {
      return `${value >= 0 ? "+" : "-"}$${absValue.toFixed(0)}`;
    }
    return `${value >= 0 ? "+" : "-"}$${absValue.toFixed(1)}`;
  };

  // Handle date cell click to open modal
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300 tracking-wide" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white tracking-wide">
              {currentMonth.format("MMMM YYYY")}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight size={18} className="text-gray-600 dark:text-gray-300 tracking-wide" />
            </button>
            <button
              onClick={() => {
                if (!dayjs().isSame(currentMonth, "month")) {
                  setAnimating(true);
                  setCurrentMonth(dayjs());
                  setTimeout(() => setAnimating(false), 400);
                }
              }}
              className="text-sm border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-200 tracking-wide"
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
                className={`border border-gray-300 dark:border-zinc-600 px-3 py-1 rounded-lg shadow-sm ${
                  monthlyStats.totalPnL >= 0
                    ? "bg-green-100/50 dark:bg-green-900/30 text-green-600"
                    : "bg-red-100/50 dark:bg-red-900/30 text-red-600"
                }`}
              >
                <span className="text-lg font-semibold tracking-wide">
                  {formatPnL(monthlyStats.totalPnL)}
                </span>
              </motion.div>
            </AnimatePresence>
            <span className="text-sm text-gray-500 dark:text-gray-400 tracking-wide">
              {monthlyStats.tradingDays} days
            </span>
            <button
              ref={settingsButtonRef}
              onClick={() => setSettingsOpen((prev) => !prev)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              title="Settings"
            >
              <Settings size={18} className="text-gray-600 dark:text-gray-300 tracking-wide" />
            </button>

            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  ref={settingsRef}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut", type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute top-10 right-0 w-72 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-700 dark:to-zinc-800 rounded-lg shadow-xl p-6 z-50 border border-gray-200 dark:border-zinc-600"
                >
                  <div className="text-sm text-gray-800 dark:text-gray-200 tracking-wide">
                    <h3 className="font-semibold text-lg mb-4 border-b border-gray-200 dark:border-zinc-600 pb-2 flex items-center">
                      <span className="text-gray-700 dark:text-gray-300">Stats</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <motion.label
                          htmlFor="showDailyPnL"
                          className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                                : "bg-gray-300 dark:bg-zinc-500"
                            }`}
                          />
                          <motion.div
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
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
                          className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                                : "bg-gray-300 dark:bg-zinc-500"
                            }`}
                          />
                          <motion.div
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
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
                          className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                                : "bg-gray-300 dark:bg-zinc-500"
                            }`}
                          />
                          <motion.div
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{
                              x: settings.showTradesCount ? 22 : 2,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          />
                        </label>
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mt-6 mb-4 border-b border-gray-200 dark:border-zinc-600 pb-2 flex items-center">
                      <span className="text-gray-700 dark:text-gray-300">Visuals</span>
                    </h3>
                    <div className="flex items-center justify-between">
                      <motion.label
                        htmlFor="colorIntensityMode"
                        className="flex items-center space-x-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                              : "bg-gray-300 dark:bg-zinc-500"
                          }`}
                        />
                        <motion.div
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
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
          <div className="flex-1">
            <div
              ref={headerRef}
              className="grid grid-cols-7 gap-[5px] text-sm text-center text-gray-700 dark:text-gray-300 mb-3 tracking-wide"
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="border border-gray-300 dark:border-zinc-600 rounded-md py-1 font-medium bg-white dark:bg-zinc-800 tracking-wide"
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
                className="grid grid-cols-7 gap-[5px] text-sm text-gray-800 dark:text-white tracking-wide"
              >
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    style={{ height: rowHeight }}
                    className="rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800"
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
                  const isWeekend = date.day() === 0 || date.day() === 6;
                  const isSelected = selectedDate && selectedDate.isSame(date, "day");

                  return (
                    <div
                      key={key}
                      style={{ height: rowHeight }}
                      onClick={() => handleDateClick(date)}
                      className={`rounded-md border ${
                        isSelected
                          ? "border-blue-500 dark:border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                          : pnl !== undefined
                          ? pnl >= 0
                            ? isExtremeDay
                              ? "border-green-500 dark:border-green-600"
                              : "border-green-400 dark:border-green-700"
                            : isExtremeDay
                            ? "border-red-400 dark:border-red-500"
                            : "border-red-300 dark:border-red-600"
                          : "border-gray-200 dark:border-zinc-700"
                      } ${isWeekend ? "bg-gray-100 dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"} ${
                        isTodayDate ? "relative shadow-[0_0_8px_rgba(255,215,0,0.5)]" : ""
                      }`}
                    >
                      <div
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={
                          pnl !== undefined
                            ? `${key}: ${pnl < 0 ? "-" : ""}$${Math.abs(pnl).toFixed(2)} | Trades: ${tradesCount}`
                            : null
                        }
                        className={`relative w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 p-1 hover:bg-purple-100/60 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-600
                          ${
                            pnl !== undefined
                              ? pnl >= 0
                                ? isExtremeDay
                                  ? "bg-green-300/60 dark:bg-green-800/50 border-green-500 dark:border-green-600 shadow-[0_0_10px_rgba(34,197,94,0.7)]"
                                  : "bg-green-200/60 dark:bg-green-900/40 border-green-400 dark:border-green-700"
                                : isExtremeDay
                                ? "bg-red-300/60 dark:bg-red-800/50 border-red-500 dark:border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
                                : "bg-red-200/60 dark:bg-red-900/40 border-red-400 dark:border-red-700"
                              : ""
                          }`}
                      >
                        <span className="absolute top-0.5 right-1 text-sm font-semibold text-gray-600 dark:text-gray-300 tracking-wide">
                          {date.date()}
                        </span>
                        {pnl !== undefined && (
                          <div className="flex flex-col items-center justify-center text-center space-y-0.5 overflow-hidden">
                            {settings.showDailyPnL && (
                              <span className={`text-sm font-sans font-bold tracking-wide ${pnl >= 0 ? "text-green-700" : "text-red-700"} whitespace-nowrap`}>
                                {formatPnL(pnl)}
                              </span>
                            )}
                            {settings.showWinRate && (
                              <span className="text-xs font-medium text-gray-500 tracking-wide">{percentage}%</span>
                            )}
                            {settings.showTradesCount && (
                              <span className="text-xs font-medium text-gray-400 tracking-wide">{tradesCount} trades</span>
                            )}
                          </div>
                        )}
                      </div>
                      {pnl !== undefined && (
                        <ReactTooltip
                          id={tooltipId}
                          place="top"
                          className="z-[1000] text-xs px-2 py-1 rounded shadow-lg bg-gray-900 text-white tracking-wide"
                        />
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentMonth.format("MM-YYYY") + "-weeks"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-[150px] flex flex-col gap-[5px]"
              style={{ marginTop: `${headerHeight + 11}px` }}
            >
              {weeklyStats.map((week, index) => (
                <div
                  key={`week-${index}`}
                  style={{ height: rowHeight }}
                  className="bg-white dark:bg-zinc-800 rounded-md px-3 py-2 text-sm flex flex-col items-center justify-center border border-gray-200 dark:border-zinc-700"
                >
                  <div className="text-gray-500 dark:text-gray-400 tracking-wide">Week {index + 1}</div>
                  <div className={`text-lg font-semibold ${week.weekPnL >= 0 ? "text-green-600" : "text-red-600"} tracking-wide`}>
                    {formatPnL(week.weekPnL)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">{week.tradingDays} days</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">{week.totalTrades} trades</div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Render the Daily Trade Modal */}
      <DailyTradeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(null);
        }}
        selectedDate={selectedDate}
        trades={trades}
        formatPnL={formatPnL}
      />
    </div>
  );
};

export default CalendarCard;
