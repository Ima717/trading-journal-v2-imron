import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useFilters } from "../context/FilterContext";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const CalendarWidget = () => {
  const { filteredTrades, dateRange, setDateRange } = useFilters();

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dayTrades = filteredTrades.filter(
      (trade) => dayjs(trade.date).format("YYYY-MM-DD") === dayjs(date).format("YYYY-MM-DD")
    );
    if (!dayTrades.length) return null;

    const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const wins = dayTrades.filter((trade) => trade.pnl > 0).length;
    const winPercent = dayTrades.length ? (wins / dayTrades.length) * 100 : 0;

    return (
      <div className="text-xs mt-1">
        <div className={dayPnL >= 0 ? "text-green-600" : "text-red-500"}>
          ${dayPnL.toFixed(2)}
        </div>
        <div className="text-gray-500">{winPercent.toFixed(1)}%</div>
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
      className="w-full"
    >
      <Calendar
        value={dateRange.start ? [new Date(dateRange.start), new Date(dateRange.end)] : new Date()}
        onChange={(value) => {
          if (Array.isArray(value)) {
            setDateRange({ start: value[0], end: value[1] });
          }
        }}
        tileContent={tileContent}
        tileClassName={tileClassName}
        className="border-none text-sm"
      />
    </motion.div>
  );
};

export default CalendarWidget;
