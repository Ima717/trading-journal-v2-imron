import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { useTheme } from "../context/ThemeContext";
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
import CurrentStreak from "../components/CurrentStreak";
import WinLossStreaks from "../components/WinLossStreaks";
import { getPnLOverTime } from "../utils/calculations";
import ErrorBoundary from "../components/ErrorBoundary";
import ResultFilter from "../components/ResultFilter";
import SearchFilter from "../components/SearchFilter";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  // Fetch trades in real-time using onSnapshot
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const q = query(collection(db, "users", user.uid, "trades"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trades = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Update P&L data
      const pnlSeries = getPnLOverTime(trades);
      setPnlData(pnlSeries);

      // Calculate tag performance
      const tagMap = {};
      trades.forEach((trade) => {
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
    }, (error) => {
      console.error("Error fetching trades:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, dateRange, resultFilter, tagSearchTerm, clickedTag]);

  const handleTagClick = (tag) => {
    setClickedTag(tag);
    setTagSearchTerm("");
    setResultFilter("all");
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 p-6 font-inter">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2 sm:mb-0">
              📊 Welcome to IMAI Dashboard
            </h1>
            <div className="flex flex-wrap gap-2">
              <Link to="/add-trade" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                ➕ Add Trade
              </Link>
              <Link to="/import" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
                📤 Import Trades
              </Link>
              <button onClick={toggleTheme} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                🔒 Log Out
              </button>
            </div>
          </div>

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
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>{formatDateRange()}</p>
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={() => setDateRange({ start: null, end: null })}
                  className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Reset Date Filter ✕
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="max-w-[300px] w-full bg-white p-6 rounded-lg shadow-sm">
                  <TotalTrades />
                </div>
                <div className="max-w-[300px] w-full bg-white p-6 rounded-lg shadow-sm">
                  <WinRate />
                </div>
                <div className="max-w-[300px] w-full bg-white p-6 rounded-lg shadow-sm">
                  <AvgPnL />
                </div>
                <div className="max-w-[300px] w-full bg-white p-6 rounded-lg shadow-sm">
                  <ProfitFactor />
                </div>
                <div className="max-w-[300px] w-full bg-white p-6 rounded-lg shadow-sm">
                  <DayWinPercent />
                </div>
                <div className="max-w-[300px] w-full bg-white p-6 rounded-lg shadow-sm">
                  <IMAIScore />
                </div>
                <div className="max-w-[300px] w-full bg-white p-6 rounded-lg shadow-sm">
                  <CurrentStreak />
                </div>
                <div className="max-w-[300px] w-full bg-white p-6 rounded-lg shadow-sm">
                  <AvgWinLoss />
                </div>
                <div className="max-w-[300px] w-full bg-white p-6 rounded-lg shadow-sm">
                  <WinLossStreaks />
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="w-full bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold mb-3 text-zinc-800 dark:text-white">📈 P&L Over Time</h2>
                  <PerformanceChart data={pnlData} />
                </div>
                <div className="w-full bg-white p-6 rounded-lg shadow-sm">
                  {tagPerformanceData.length > 0 ? (
                    <>
                      <h2 className="text-xl font-bold mb-3 text-zinc-800 dark:text-white">📈 Tag Performance</h2>
                      <ChartTagPerformance data={tagPerformanceData} onTagClick={handleTagClick} />
                      {clickedTag && filteredTrades.length === 0 && (
                        <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                          No trades found for tag "<span className="font-semibold">{clickedTag}</span>" with current filters.
                        </p>
                      )}
                    </>
                  ) : tagSearchTerm ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No tags found for "{tagSearchTerm}".</p>
                  ) : null}
                </div>
              </div>

              {/* Trade Table */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                {(resultFilter !== "all" || clickedTag) && (
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Showing: {resultFilter !== "all" ? resultFilter : ""}{" "}
                    {clickedTag ? `(${clickedTag} trades)` : ""}
                  </div>
                )}
                <TradeTable trades={filteredTrades} />
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
