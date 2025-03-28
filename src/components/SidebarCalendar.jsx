// /src/components/SidebarCalendar.jsx
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useFilters } from "../context/FilterContext";

const SidebarCalendar = () => {
  const { dateRange, setDateRange, filteredTrades } = useFilters();

  const onChange = (date) => {
    const start = date instanceof Array ? date[0] : date;
    const end = date instanceof Array ? date[1] : date;
    setDateRange({ start, end });
  };

  // Calculate trade count for each date
  const getTradeCountForDate = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return filteredTrades.filter((trade) => trade.date === formattedDate).length;
  };

  // Custom tile content to add tooltips
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const tradeCount = getTradeCountForDate(date);
      return tradeCount > 0 ? (
        <div className="relative">
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {tradeCount}
          </span>
        </div>
      ) : null;
    }
    return null;
  };

  // Add tooltip using title attribute
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const tradeCount = getTradeCountForDate(date);
      return tradeCount > 0 ? "has-trades" : "";
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Calendar</h3>
      <Calendar
        onChange={onChange}
        value={[dateRange.start, dateRange.end]}
        selectRange={true}
        tileContent={tileContent}
        tileClassName={tileClassName}
        className="border-none text-zinc-800 dark:text-zinc-100 bg-transparent"
        calendarType="US"
        title={(date) => {
          const tradeCount = getTradeCountForDate(date);
          return tradeCount > 0 ? `${tradeCount} trade${tradeCount > 1 ? "s" : ""} on this day` : null;
        }}
      />
      <style jsx>{`
        .has-trades {
          position: relative;
        }
        .react-calendar__tile {
          padding: 8px;
          color: #333;
        }
        .react-calendar__tile--active {
          background: #2563eb !important;
          color: white !important;
        }
        .react-calendar__tile--now {
          background: #e5e7eb !important;
        }
        .dark .react-calendar__tile--now {
          background: #4b5563 !important;
        }
        .dark .react-calendar__tile--active {
          background: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

export default SidebarCalendar;
