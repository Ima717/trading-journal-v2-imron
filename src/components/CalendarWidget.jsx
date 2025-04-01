// CalendarWidget.jsx – Trade-colored calendar with tooltip + hover polish

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useFilters } from "../context/FilterContext";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const CalendarWidget = () => {
  const { user } = useAuth();
  const { dateRange, setDateRange } = useFilters();
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "trades"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tradeData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTrades(tradeData);
      },
      (error) => {
        console.error("Error fetching trades:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDateSelect = (value) => {
    const formatted = dayjs(value).format("YYYY-MM-DD");
    setDateRange({ start: formatted, end: formatted });
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const formatted = dayjs(date).format("YYYY-MM-DD");
    const dayTrades = trades.filter((t) => t.date === formatted);
    if (dayTrades.length === 0) return null;

    const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    if (dayPnL > 0) return "bg-green-100 text-green-700 font-bold rounded-full";
    if (dayPnL < 0) return "bg-red-100 text-red-700 font-bold rounded-full";
    return "bg-gray-100 text-gray-700 font-bold rounded-full";
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const formatted = dayjs(date).format("YYYY-MM-DD");
    const dayTrades = trades.filter((t) => t.date === formatted);
    if (dayTrades.length === 0) return null;

    const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    return (
      <>
        <div
          data-tooltip-id={`calendar-${formatted}`}
          data-tooltip-content={`P&L: $${dayPnL.toFixed(2)}, Trades: ${dayTrades.length}`}
          className="h-1 w-1 bg-gray-300 rounded-full mx-auto mt-1"
        />
        <Tooltip id={`calendar-${formatted}`} />
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm"
    >
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-semibold">📅 Calendar</h3>
      <Calendar
        onClickDay={handleDateSelect}
        tileClassName={tileClassName}
        tileContent={tileContent}
        className="border-none text-gray-800 dark:text-white"
      />
      {(dateRange.start || dateRange.end) && (
        <button
          onClick={() => setDateRange({ start: null, end: null })}
          className="mt-3 text-sm underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Reset Date Filter ✕
        </button>
      )}

      <style jsx>{`
        .react-calendar {
          font-family: 'Inter', sans-serif;
        }
        .react-calendar__navigation {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }
        .react-calendar__navigation__label {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }
        .react-calendar__navigation__arrow {
          font-size: 1.5rem;
          color: #6b7280;
        }
        .react-calendar__month-view__weekdays {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
        }
        .react-calendar__month-view__days__day {
          font-size: 0.875rem;
          color: #1f2937;
          padding: 0.5rem;
        }
        .react-calendar__month-view__days__day--weekend {
          color: #1f2937;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #9ca3af;
        }
        .react-calendar__tile {
          border-radius: 9999px;
          transition: background-color 0.2s, color 0.2s;
        }
        .react-calendar__tile:hover {
          background-color: #f3f4f6;
        }
        .react-calendar__tile--active {
          background-color: #007bff !important;
          color: white !important;
        }
      `}</style>
    </motion.div>
  );
};

export default CalendarWidget;
