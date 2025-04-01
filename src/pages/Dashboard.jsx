import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { useTheme } from "../context/ThemeContext";
import dayjs from "dayjs";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { motion } from "framer-motion";

import TradeTabs from "../components/TradeTabs";
import ChartTagPerformance from "../components/ChartTagPerformance";
import PerformanceChart from "../components/PerformanceChart";
import ChartZellaScore from "../components/ChartZellaScore";
import CalendarWidget from "../components/CalendarWidget";
import StatCard from "../components/StatCard";
import AvgWinLoss from "../components/AvgWinLoss";
import { getPnLOverTime, getZellaScoreOverTime } from "../utils/calculations.js";
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
  const [zellaTrendData, setZellaTrendData] = useState([]);
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

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const q = query(collection(db, "users", user.uid, "trades"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const trades = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const pnlSeries = getPnLOverTime(trades);
        const zellaSeries = getZellaScoreOverTime(trades);
        setPnlData(pnlSeries);
        setZellaTrendData(zellaSeries);

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
      },
      (error) => {
        console.error("Error fetching trades:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, dateRange, resultFilter, tagSearchTerm, clickedTag]);

  const handleTagClick = (tag) => {
    setClickedTag(tag);
    setTagSearchTerm("");
    setResultFilter("all");
  };

  const netPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter((t) => t.pnl > 0);
  const losses = filteredTrades.filter((t) => t.pnl < 0);
  const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
  const tradingDays = [...new Set(filteredTrades.map((t) => t.date))];
  const winningDays = tradingDays.filter((day) => {
    const dayPnL = filteredTrades.filter((t) => t.date === day).reduce((sum, t) => sum + t.pnl, 0);
    return dayPnL > 0;
  });
  const dayWinPercent = tradingDays.length ? (winningDays.length / tradingDays.length) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0;
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;
  const profitFactor = losses.length ? wins.reduce((s, t) => s + t.pnl, 0) / Math.abs(losses.reduce((s, t) => s + t.pnl, 0)) : 0;
  const zellaScore = Math.min((winRate * 0.4 + profitFactor * 10 * 0.3 + dayWinPercent * 0.3), 100).toFixed(2);
  const biggestWin = Math.max(...filteredTrades.map((t) => t.pnl || 0));
  const biggestLoss = Math.min(...filteredTrades.map((t) => t.pnl || 0));

  const getWinRateBackground = () => {
    if (winRate > 60) return "bg-gradient-to-r from-green-400 to-green-500 text-white";
    if (winRate >= 40) return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white";
    return "bg-gradient-to-r from-red-400 to-red-500 text-white";
  };

  const donut = (
    <CircularProgressbar
      value={wins.reduce((s, t) => s + t.pnl, 0)}
      maxValue={wins.reduce((s, t) => s + t.pnl, 0) + Math.abs(losses.reduce((s, t) => s + t.pnl, 0))}
      strokeWidth={10}
      styles={buildStyles({
        pathColor: profitFactor >= 1 ? "#10b981" : "#ef4444",
        trailColor: "#f87171",
        strokeLinecap: "round",
      })}
    />
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-inter">
        <div className="px-4 py-6 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard
                  title="Net P&L"
                  value={`$${netPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  color={netPnL >= 0 ? "text-green-600" : "text-red-500"}
                  tooltip="The total realized net profit and loss for all closed trades."
                  badge={totalTrades}
                />
                <StatCard
                  title="Profit Factor"
                  value={profitFactor.toFixed(2)}
                  tooltip="Gross Profit / Gross Loss"
                >
                  {donut}
                </StatCard>
                <StatCard
                  title="Trade Win %"
                  value={`${winRate.toFixed(2)}%`}
                  tooltip="Percentage of all trades that closed with profit."
                  customBg={getWinRateBackground()}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <StatCard title="Day Win %" value={`${dayWinPercent.toFixed(2)}%`} tooltip="Winning days / Total days" />
                <AvgWinLoss />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="w-full bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
                  <CalendarWidget />
                </div>
                <div className="w-full">
                  <PerformanceChart data={pnlData} />
                </div>
              </div>

              <div className="w-full mb-6">
                <ChartZellaScore data={zellaTrendData} />
              </div>

              <div className="w-full mb-6">
                {tagPerformanceData.length > 0 ? (
                  <>
                    <ChartTagPerformance data={tagPerformanceData} onTagClick={handleTagClick} />
                    {clickedTag && filteredTrades.length === 0 && (
                      <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                        No trades found for tag "<span className="font-semibold">{clickedTag}</span>" with current filters.
                      </p>
                    )}
                  </>
                ) : tagSearchTerm ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tags found for "{tagSearchTerm}".
                  </p>
                ) : null}
              </div>

              <div className="w-full mb-6">
                <TradeTabs filteredTrades={filteredTrades} />
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
