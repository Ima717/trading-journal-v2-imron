// /src/components/SidebarCalendar.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useFilters } from "../context/FilterContext";
import { Tooltip } from "react-tooltip";

const SidebarCalendar = () => {
  const { filteredTrades, setDateRange } = useFilters();
  const [date, setDate] = useState(new Date());
  const [dailyPnL, setDailyPnL] = useState({});

  useEffect(() => {
    const pnLMap = {};
    filteredTrades.forEach((trade) => {
      const tradeDate = trade.date;
      if (!pnLMap[tradeDate]) pnLMap[tradeDate] = 0;
      pnLMap[tradeDate] += trade.pnl;
    });
    setDailyPnL(pnLMap);
  }, [filteredTrades]);

  const tileClassName = ({ date }) => {
    const dateString = date.toISOString().split("T")[0];
    const pnL = dailyPnL[dateString] || 0;
    if (pnL > 0) return "bg-green-200 hover:bg-green-300";
    if (pnL < 0) return "bg-red-200 hover:bg-red-300";
    return "bg-gray-200 hover:bg-gray-300";
  };

  const tileContent = ({ date }) => {
    const dateString = date.toISOString().split("T")[0];
    const pnL = dailyPnL[dateString] || 0;
    return pnL !== 0 ? (
      <div
        data-tooltip-id="calendar-tooltip"
        data-tooltip-content={pnL > 0 ? `+$${pnL}` : `-$${Math.abs(pnL)}`}
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs text-gray-800"
      >
        {pnL > 0 ? `+$${pnL}` : `-$${Math.abs(pnL)}`}
      </div>
    ) : null;
  };

  const onChange = (newDate) => {
    setDate(newDate);
    setDateRange({
      start: newDate.toISOString().split("T")[0],
      end: newDate.toISOString().split("T")[0],
    });
  };

  return (
    <div className="bg-white shadow rounded-xl p-4 animate-fade-in relative" style={{ overflow: "visible" }}>
      <h3 className="text-sm text-gray-600 mb-3">Calendar</h3>
      <Calendar
        onChange={onChange}
        value={date}
        tileClassName={tileClassName}
        tileContent={tileContent}
        className="border-none"
      />
      <Tooltip
        id="calendar-tooltip"
        place="top"
        style={{
          zIndex: 9999, // Increased z-index to ensure visibility
          backgroundColor: "#333",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      />
    </div>
  );
};

export default SidebarCalendar;
