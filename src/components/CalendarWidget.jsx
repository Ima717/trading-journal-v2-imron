import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useFilters } from "../context/FilterContext";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { CalendarDays, RotateCcw } from "lucide-react";

const CalendarWidget = () => {
  const { filteredTrades, setDateRange } = useFilters();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDateChange = (value) => {
    if (Array.isArray(value)) {
      setDateRange({ start: value[0], end: value[1] });
    }
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dayTrades = filteredTrades.filter(
      (trade) => dayjs(trade.date).format("YYYY-MM-DD") === dayjs(date).format("YYYY-MM-DD")
    );
    if (!dayTrades.length) return null;

    const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const wins = dayTrades.filter((t) => t.pnl > 0).length;
    const winRate = dayTrades.length ? (wins / dayTrades.length) * 100 : 0;

    return (
      <div className="text-[11px] mt-1 text-center leading-tight">
        <div className={dayPnL >= 0 ? "text-green-600" : "text-red-500"}>
          ${dayPnL.toFixed(0)}
        </div>
        <div className="text-gray-500">{winRate.toFixed(0)}%</div>
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const dayTrades = filteredTrades.filter(
      (trade) => dayjs(trade.date).format("YYYY-MM-DD") === dayjs(date).format("YYYY-MM-DD")
    );
    if (!dayTrades.length) return null;

    const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    return dayPnL >= 0 ? "bg-green-100" : "bg-red-100";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <CalendarDays size={16} />
          Trading Calendar — {dayjs(currentDate).format("MMMM YYYY")}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="text-xs flex items-center gap-1 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-zinc-600 transition-all"
        >
          <RotateCcw size={12} /> Today
        </button>
      </div>

      <div className="overflow-x-auto">
        <Calendar
          value={currentDate}
          onChange={(value) => {
            setCurrentDate(value);
            handleDateChange(value);
          }}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className="REACT-CALENDAR p-2 text-xs"
          prev2Label={null}
          next2Label={null}
        />
      </div>
    </motion.div>
  );
};

export default CalendarWidget;
