import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useFilters } from "../context/FilterContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";

const DashboardSidebar = () => {
  const { user } = useAuth();
  const { dateRange, setDateRange } = useFilters();
  const [tradeDates, setTradeDates] = useState([]);

  useEffect(() => {
    const fetchDates = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const trades = snapshot.docs.map((doc) => doc.data());
      const uniqueDates = [...new Set(trades.map((t) => t.date))];
      setTradeDates(uniqueDates);
    };

    fetchDates();
  }, [user]);

  const handleDateSelect = (value) => {
    const formatted = dayjs(value).format("YYYY-MM-DD");
    setDateRange({ start: formatted, end: formatted });
  };

  const tileClassName = ({ date, view }) => {
    const formatted = dayjs(date).format("YYYY-MM-DD");
    if (tradeDates.includes(formatted)) {
      return "bg-purple-100 text-purple-700 font-bold";
    }
    return null;
  };

  return (
    <div className="w-full sm:w-64 p-4 bg-white shadow-md rounded-xl">
      <h2 className="text-lg font-semibold mb-2">📅 Calendar</h2>
      <Calendar
        onClickDay={handleDateSelect}
        tileClassName={tileClassName}
      />
      {(dateRange.start || dateRange.end) && (
        <button
          onClick={() => setDateRange({ start: null, end: null })}
          className="mt-3 text-sm underline text-blue-600 hover:text-blue-800"
        >
          Reset Date Filter ✕
        </button>
      )}
    </div>
  );
};

export default DashboardSidebar;
