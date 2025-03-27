// /src/pages/Dashboard.jsx
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
import ChartTagPerformance from "../components/ChartTagPerformance";
import PerformanceChart from "../components/PerformanceChart";
import DashboardSidebar from "../components/DashboardSidebar";
import TotalTrades from "../components/TotalTrades";
import WinRate from "../components/WinRate";
import AvgPnL from "../components/AvgPnL";
import ProfitFactor from "../components/ProfitFactor";
import DayWinPercent from "../components/DayWinPercent";
import AvgWinLoss from "../components/AvgWinLoss";
import IMAIScore from "../components/IMAIScore";
import ProgressTracker from "../components/ProgressTracker";
import CurrentStreak from "../components/CurrentStreak";
import RiskRewardRatio from "../components/RiskRewardRatio";
import WinLossStreaks from "../components/WinLossStreaks";
import PerformanceByTag from "../components/PerformanceByTag";
import { getPnLOverTime } from "../utils/calculations";
import ErrorBoundary from "../components/ErrorBoundary";
import ResultFilter from "../components/ResultFilter";
import SearchFilter from "../components/SearchFilter";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    dateRange,
    setDateRange,
    resultFilter,
    setResultFilter,
    tagSearchTerm,
    setTagSearchTerm,
    clickedTag,
    setClickedTag,
    filteredTrades,
  } = useFilters();

  const [tagPerformanceData, setTagPerformanceData] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

      setIsLoading(true);

      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const trades = snapshot.docs.map((doc) => doc.data());

      const pnlSeries = getPnLOverTime(filteredTrades);
      setPnlData(pnlSeries);

      const tagMap = {};
      filteredTrades.forEach((trade) => {
        if (Array.isArray(trade.tags)) {
          trade.tags.forEach((tag) => {
            if (!tagMap[tag]) tagMap[tag] = { totalPnL: 0, count: 0 };
            tagMap[tag].totalPnL += trade.pnl || 0;
            tagMap[tag].count += 1;
          });
        }
      });

      let formatted = Object.entries(tagMap).map(([tag, val]) => ({
        tag,
        avgPnL: parseFloat((val.totalPnL / val.count).toFixed(2)),
      }));

      if (tagSearchTerm && typeof tagSearchTerm === "string") {
        formatted = formatted.filter((item) =>
          item.tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
        );
      }

      setTagPerformanceData(formatted);
      setIsLoading(false);
    };

    fetchTagPerformance();
  }, [user, dateRange, resultFilter, tagSearchTerm, clickedTag, filteredTrades]);

  const handleTagClick = (tag) => {
    setClickedTag(tag);
    setTagSearchTerm("");
    setResultFilter("all");
    tradeTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center max-w-7xl mx-auto mb-8">
          <h1 className="text-2xl font-bold text-zinc-800 mb-2 sm:mb-0">📊 Welcome to IMAI Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <Link to="/add-trade" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">➕ Add Trade</Link>
            <Link to="/import" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">📤 Import Trades</Link>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">🔒 Log Out</button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DashboardSidebar />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-wrap gap-4 justify-between items-end mb-4">
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

            {/* First Row: Total Trades, Win Rate, Avg PnL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="max-w-[300px] w-full border border-gray-200 rounded-xl"><TotalTrades /></div>
              <div className="max-w-[300px] w-full border border-gray-200 rounded-xl"><WinRate /></div>
              <div className="max-w-[300px] w-full border border-gray-200 rounded-xl"><AvgPnL /></div>
            </div>

            {/* Second Row: IMAI Score, Profit Factor, Day Win % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="max-w-[300px] w-full"><ProfitFactor /></div>
              <div className="max-w-[300px] w-full"><DayWinPercent /></div>
              <div className="max-w-[300px] w-full"><IMAIScore /></div>
            </div>

            {/* Third Row: Progress Tracker, Current Streak, Avg Win/Loss Trade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="max-w-[300px] w-full"><ProgressTracker /></div>
              <div className="max-w-[300px] w-full"><CurrentStreak /></div>
              <div className="max-w-[300px] w-full"><AvgWinLoss /></div>
            </div>

            {/* Fourth Row: Risk-Reward Ratio, Win/Loss Streaks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="max-w-[300px] w-full"><RiskRewardRatio /></div>
              <div className="max-w-[300px] w-full"><WinLossStreaks /></div>
            </div>

            {/* Fifth Row: PNL Over Time, Tag Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="w-full">
                {isLoading ? (
                  <div className="bg-white shadow rounded-xl p-4 text-center h-48 flex items-center justify-center">
                    <p className="text-gray-500">Loading chart...</p>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <PerformanceChart data={pnlData} />
                  </div>
                )}
              </div>
              <div className="w-full">
                {isLoading ? (
                  <div className="bg-white shadow rounded-xl p-4 text-center h-48 flex items-center justify-center">
                    <p className="text-gray-500">Loading chart...</p>
                  </div>
                ) : (
                  <>
                    {tagPerformanceData.length > 0 ? (
                      <div className="animate-fade-in">
                        <h2 className="text-xl font-bold mb-3">📈 Tag Performance</h2>
                        <ChartTagPerformance data={tagPerformanceData} onTagClick={handleTagClick} />
                        {clickedTag && filteredTrades.length === 0 && (
                          <p className="text-sm text-red-500 mt-2">
                            No trades found for tag "<span className="font-semibold">{clickedTag}</span>" with current filters.
                          </p>
                        )}
                      </div>
                    ) : tagSearchTerm ? (
                      <p className="text-sm text-gray-500">No tags found for "{tagSearchTerm}".</p>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            {/* Sixth Row: Performance by Tag */}
            <div className="grid grid-cols-1 gap-6">
              <PerformanceByTag />
            </div>

            {/* Trade Table */}
            <div ref={tradeTableRef}>
              {(resultFilter !== "all" || clickedTag) && (
                <div className="mb-2 text-sm text-gray-600">
                  Showing: {resultFilter !== "all" ? resultFilter : ""}{" "}
                  {clickedTag ? `(${clickedTag} trades)` : ""}
                </div>
              )}
              <TradeTable trades={filteredTrades} />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
