import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const CalendarView = () => {
  const { user } = useAuth();
  const [tradesByDate, setTradesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("📅 CalendarView mounted");
    if (!user) return;

    const fetchTrades = async () => {
      try {
        const ref = collection(db, "users", user.uid, "trades");
        const snapshot = await getDocs(ref);
        const trades = snapshot.docs.map((doc) => doc.data());

        const byDate = {};
        trades.forEach((trade) => {
          const date = trade.date;
          if (!byDate[date]) byDate[date] = [];
          byDate[date].push(trade);
        });

        console.log("✅ Trades fetched:", byDate);
        setTradesByDate(byDate);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching trades:", error);
      }
    };

    fetchTrades();
  }, [user]);

  const handleDateClick = (value) => {
    const formatted = value.toLocaleDateString("en-CA"); // gives YYYY-MM-DD format
    setSelectedDate(formatted);
    console.log("📆 Selected date:", formatted);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">📅 Trade Calendar</h1>

      {loading ? (
        <p>Loading calendar...</p>
      ) : (
        <>
          <div className="bg-white p-4 rounded shadow">
            <Calendar onClickDay={handleDateClick} />
          </div>

          {selectedDate && (
            <div className="mt-6 bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">
                Trades on {selectedDate}
              </h2>
              {tradesByDate[selectedDate] ? (
                <ul className="space-y-2 text-sm">
                  {tradesByDate[selectedDate].map((trade, i) => (
                    <li key={i} className="border-b pb-2">
                      <strong>{trade.symbol}</strong> — ${trade.pnl} ({trade.result})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No trades for this day.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CalendarView;
