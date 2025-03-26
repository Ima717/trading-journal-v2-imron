import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import dayjs from "dayjs";

import AnalyticsOverview from "../components/AnalyticsOverview";
import TradeTable from "../components/TradeTable";
import SummaryCards from "../components/SummaryCards";
import ChartTagPerformance from "../components/ChartTagPerformance";
import PerformanceChart from "../components/PerformanceChart";
import { getPnLOverTime } from "../utils/calculations";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dateRange, setDateRange } = useFilters();

  const [tagPerformanceData, setTagPerformanceData] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatDateRange = () => {
    if (!dateRange.start || !dateRange.end) return "Showing all data";
    const start = dayjs(dateRange.start).format("MMM D");
    const end = dayjs(dateRange.end).format("MMM D");
    return start === end
      ? `Showing trades for ${start}`
      : `Showing trades from ${start} to ${end}`;
  };

  useEffect(() => {
    const fetchTagPerformance = async () => {
      if (!user) return;

      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const trades = snapshot.docs.map((doc) => doc.data());

      // ⏳ Filter trades by selected date range
      let filtered = trades;
      if (dateRange.start && dateRange.end) {
        filtered = trades.filter((trade) => {
          const tradeDate = dayjs(trade.date);
          return tradeDate.isAfter(dayjs(dateRange.start).subtract(1, "day")) &&
                 tradeDate.isBefore(dayjs(dateRange.end).add(1, "day"));
        });
      }
      setFilteredTrades(filtered);

      // ✅ Set PnL data for chart
      const pnlSeries = getPnLOverTime(filtered);
      setPnlData(pnlSeries);

      // ✅ Tag performance logic
      const tagMap = {};
      filtered.forEach((trade) => {
        if (Array.isArray(trade.tags)) {
          trade.tags.forEach((tag) => {
            if (!tagMap[tag]) tagMap[tag] = { totalPnL: 0, count: 0 };
            tagMap[tag].totalPnL += trade.pnl || 0;
            tagMap[tag].count += 1;
          });
        }
      });

      const formatted = Object.entries(tagMap).map(([tag, val]) => ({
        tag,
        avgPnL: parseFloat((val.totalPnL / val.count).toFixed(2)),
      }));

      setTagPerformanceData(formatted);
    };

    fetchTagPerformance();
  }, [user, dateRange]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">📊 Welcome to IMAI Dashboard</h1>
        <div className="space-x-2">
          <Link to="/calendar" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">📅 Calendar</Link>
          <Link to="/add-trade" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">➕ Add Trade</Link>
          <Link to="/test" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">🧪 Test</Link>
          <Link to="/import" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">📤 Import Trades</Link>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">🔒 Log Out</button>
        </div>
      </div>

      {/* Date Range Info */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600">{formatDateRange()}</p>
        {(dateRange.start || dateRange.end) && (
          <button
            onClick={() => setDateRange({ start: null, end: null })}
            className="text-sm underline text-blue-600 hover:text-blue-800"
          >
            Reset Date Filter ✕
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* PnL Over Time Chart */}
      {pnlData.length > 0 && (
        <div className="max-w-6xl mx-auto mb-10">
          <PerformanceChart data={pnlData} />
        </div>
      )}

      {/* Analytics Overview */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold my-4">Analytics Overview</h2>
        <AnalyticsOverview />
      </div>

      {/* Tag Performance Chart */}
      {tagPerformanceData.length > 0 && (
        <div className="max-w-6xl mx-auto mt-10">
          <h2 className="text-xl font-bold mb-3">📈 Tag Performance</h2>
          <ChartTagPerformance data={tagPerformanceData} />
        </div>
      )}

      {/* Trade Table */}
      <div className="max-w-6xl mx-auto mt-10">
        <TradeTable trades={filteredTrades} />
      </div>
    </div>
  );
};

export default Dashboard;
