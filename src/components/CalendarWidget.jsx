import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useFilters } from "../context/FilterContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";

const CalendarWidget = () => {
  const { user } = useAuth();
  const { dateRange, setDateRange } = useFilters();
  const [trades, setTrades] = useState([]);

  // Fetch trades in real-time
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "trades"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradeData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrades(tradeData);
    }, (error) => {
      console.error("Error fetching trades:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDateSelect = (value) => {
    const formatted = dayjs(value).format("YYYY-MM-DD");
    setDateRange({ start: formatted, end: formatted });
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const formatted = dayjs(date).format("YYYY-MM-DD");
    const dayTrades = trades.filter((trade) => trade.date === formatted);
    if (dayTrades.length === 0) return null;

    const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    if (dayPnL > 0) return "bg-green-100 text-green-700 font-bold";
    if (dayPnL < 0) return "bg-red-100 text-red-700 font-bold";
    return "bg-gray-100 text-gray-700 font-bold";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-sm text-gray-600 mb-3">Calendar</h3>
      <Calendar
        onClickDay={handleDateSelect}
        tileClassName={tileClassName}
        className="border-none"
        tileContent={({ date, view }) => {
          if (view !== "month") return null;
          const formatted = dayjs(date).format("YYYY-MM-DD");
          const dayTrades = trades.filter((trade) => trade.date === formatted);
          if (dayTrades.length === 0) return null;
          return <div className="h-1 w-1 bg-gray-300 rounded-full mx-auto mt-1"></div>;
        }}
      />
      {(dateRange.start || dateRange.end) && (
        <button
          onClick={() => setDateRange({ start: null, end: null })}
          className="mt-3 text-sm underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Reset Date Filter ✕
        </button>
      )}
    </div>
  );
};

export default CalendarWidget;
