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
  const [error, setError] = useState(null); // 🛠 track errors

  useEffect(() => {
    const fetchTrades = async () => {
      console.log("👤 Current user:", user);
      if (!user) {
        setLoading(false); // <- stop loading if not logged in
        return;
      }

      try {
        const ref = collection(db, "users", user.uid, "trades");
        const snapshot = await getDocs(ref);
        const trades = snapshot.docs.map((doc) => doc.data());

        console.log("📊 Fetched trades:", trades);

        const byDate = {};
        trades.forEach((trade) => {
          const date = trade.date;
          if (!byDate[date]) {
            byDate[date] = [];
          }
          byDate[date].push(trade);
        });

        setTradesByDate(byDate);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching trades:", err);
        setError("Failed to load trades.");
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  const handleDateClick = (value) => {
    const formatted = value.toISOString().split("T")[0];
    setSelectedDate(formatted);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">📅 Trade Calendar</h1>

      {loading ? (
        <p>⏳ Loading calendar...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : !user ? (
        <p className="text-yellow-600">You need to be signed in to see your calendar.</p>
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
