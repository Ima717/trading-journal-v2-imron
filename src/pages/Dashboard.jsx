import React, { useEffect, useState, useRef } from "react";
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
import DashboardSidebar from "../components/DashboardSidebar";
import { getPnLOverTime } from "../utils/calculations";

import ResultFilter from "../components/ResultFilter";
import SearchFilter from "../components/SearchFilter";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    dateRange,
    setDateRange,
    resultType,
    setResultType,
    tagSearchTerm,
    setTagSearchTerm,
  } = useFilters();

  const [tagPerformanceData, setTagPerformanceData] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [clickedTag, setClickedTag] = useState(null);

  const tradeTableRef = useRef(null);

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

      let filtered = trades;

      if (dateRange.start && dateRange.end) {
        filtered = filtered.filter((trade) => {
          const tradeDate = dayjs(trade.date);
          return (
            tradeDate.isAfter(dayjs(dateRange.start).subtract(1, "day")) &&
            tradeDate.isBefore(dayjs(dateRange.end).add(1, "day"))
          );
        });
      }

      if (resultType !== "all") {
        filtered = filtered.filter((trade) => trade.result === resultType);
      }

      if (tagSearchTerm.trim() !== "") {
        filtered = filtered.filter((trade) =>
          trade.tags?.some((tag) =>
            tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
          )
        );
      }

      if (clickedTag) {
        filtered = filtered.filter((trade) =>
          trade.tags?.includes(clickedTag)
        );
      }

      setFilteredTrades(filtered);

      const pnlSeries = getPnLOverTime(filtered);
      setPnlData(pnlSeries);

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
  }, [user, dateRange, resultType, tagSearchTerm, clickedTag]);

  const handleTagClick = (tag) => {
    setClickedTag(tag);
    setTagSearchTerm(""); // ✅ Clear the search input
    setResultType("all"); // ✅ Optional: reset result filter
    tradeTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-zinc-800 mb-2 sm:mb-0">📊 Welcome to IMAI Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/calendar" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">📅 Calendar</Link>
          <Link to="/add-trade" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">➕ Add Trade</Link>
          <Link to="/import" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">📤 Import Trades</Link>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">🔒 Log Out</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Calendar */}
        <div className="lg:col-span-1">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-10">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-between items-end mb-6">
            <ResultFilter />
            <SearchFilter
              searchTerm={tagSearchTerm}
              onSearchChange={(term) => setTagSearchTerm(term)}
              selectedTag={clickedTag}
              onClear={() => {
                setTagSearchTerm("");
                setClickedTag(null);
              }}
            />
            <div className="text-sm text-gray-600">
              <p>{formatDateRange()}</p>
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={() => setDateRange({ start: null, end: null })}
                  className="underline text-blue-600 hover:text-blue-800"
                >
                  Reset Date Filter ✕
                </button>
              )}
            </div>
          </div>

          <SummaryCards trades={filteredTrades} />

          {pnlData.length > 0 && <PerformanceChart data={pnlData} />}

          <div>
            <h2 className="text-2xl font-bold mb-4">Analytics Overview</h2>
            <AnalyticsOverview />
          </div>

          {tagPerformanceData.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">📈 Tag Performance</h2>
              <ChartTagPerformance data={tagPerformanceData} onTagClick={handleTagClick} />

              {clickedTag && filteredTrades.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  No trades found for tag "<span className="font-semibold">{clickedTag}</span>" with current filters.
                </p>
              )}
            </div>
          )}

          <div ref={tradeTableRef}>
            <TradeTable trades={filteredTrades} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
