import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { useTheme } from "../context/ThemeContext";
import dayjs from "dayjs";
import { CircularProgressbar } from "react-circular-progressbar";

import TradeTable from "../components/TradeTable";
import ChartTagPerformance from "../components/ChartTagPerformance";
import PerformanceChart from "../components/PerformanceChart";
import CalendarWidget from "../components/CalendarWidget";
import StatCard from "../components/StatCard";
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

  // Calculate stats
  const netPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter((t) => t.pnl > 0);
  const losses = filteredTrades.filter((t) => t.pnl < 0);
  const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
  const tradingDays = [...new Set(filteredTrades.map((t) => t.date))];
  const winningDays = tradingDays.filter((day) => {
    const dayTrades = filteredTrades.filter((t) => t.date === day);
    const dayPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    return dayPnL > 0;
  });
  const dayWinPercent = tradingDays.length
    ? (winningDays.length / tradingDays.length) * 100
    : 0;
  const avgWin = wins.length
    ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length
    : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length)
    : 0;
  const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * Math.abs(avgLoss));
  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss !== 0 ? grossProfit / grossLoss : 0;
  let dayStreak = 0;
  const tradingDaysSorted = [...new Set(filteredTrades.map((t) => t.date))].sort();
  for (let i = tradingDaysSorted.length - 1; i >= 0; i--) {
    const dayTrades = filteredTrades.filter((t) => t.date === tradingDaysSorted[i]);
    const dayPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    if (dayPnL <= 0) break;
    dayStreak++;
  }
  let tradeStreak = 0;
  for (let i = filteredTrades.length - 1; i >= 0; i--) {
    if (filteredTrades[i].pnl <= 0) break;
    tradeStreak++;
  }
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  filteredTrades.forEach((trade) => {
    if (trade.pnl >= 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  });
  const maxDrawdown = filteredTrades.length
    ? Math.min(...filteredTrades.map((t) => t.pnl))
    : 0;
  const avgDrawdown = losses.length
    ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length)
    : 0;
  const zellaScore = Math.min(
    (winRate * 0.4 + profitFactor * 10 * 0.3 + dayWinPercent * 0.3),
    100
  ).toFixed(2);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 p-6 font-inter">
        <div className="max-w-7xl mx-auto">
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
              {/* Stat Cards and Calendar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard
                  title="Net P&L"
                  value={`$${netPnL.toFixed(2)}`}
                  color={netPnL >= 0 ? "text-green-600" : "text-red-500"}
                  tooltip="Sum of profits - losses"
                />
                <StatCard title="Total Trades" value={totalTrades} />
                <StatCard title="Trade Win %" value={`${winRate.toFixed(2)}%`} />
                <StatCard title="Day Win %" value={`${dayWinPercent.toFixed(2)}%`} />
                <StatCard
                  title="Avg Win Trade"
                  value={`$${avgWin.toFixed(2)}`}
                  color="text-green-600"
                />
                <StatCard
                  title="Avg Loss Trade"
                  value={`$${avgLoss.toFixed(2)}`}
                  color="text-red-500"
                />
                <StatCard
                  title="Trade Expectancy"
                  value={`$${expectancy.toFixed(2)}`}
                  tooltip="(Win % * Avg Win) - (Loss % * Avg Loss)"
                />
                <StatCard
                  title="Profit Factor"
                  value={profitFactor.toFixed(2)}
                  color={profitFactor >= 1 ? "text-green-600" : "text-red-500"}
                  tooltip="Gross Profit / Gross Loss"
                />
                <div className="bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center">
                  <h3 className="text-sm text-gray-600">Zella Score</h3>
                  <div className="mt-2 w-24 h-24">
                    <CircularProgressbar
                      value={zellaScore}
                      text={`${zellaScore}`}
                      styles={{
                        path: { stroke: "#007bff" },
                        text: { fill: "#343a40", fontSize: "24px" },
                      }}
                    />
                  </div>
                </div>
                <StatCard title="Current Day Streak" value={dayStreak} color="text-green-600" />
                <StatCard title="Current Trade Streak" value={tradeStreak} color="text-green-600" />
                <StatCard
                  title="Max Drawdown"
                  value={`$${maxDrawdown.toFixed(2)}`}
                  color="text-red-500"
                />
                <StatCard
                  title="Avg Drawdown"
                  value={`$${avgDrawdown.toFixed(2)}`}
                  color="text-red-500"
                />
                <StatCard title="Longest Win Streak" value={longestWinStreak} color="text-green-600" />
                <StatCard title="Longest Loss Streak" value={longestLossStreak} color="text-red-500" />
                <div className="w-full bg-white p-6 rounded-lg shadow-sm">
                  <CalendarWidget />
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="w-full">
                  <PerformanceChart data={pnlData} />
                </div>
                <div className="w-full">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">No tags found for "{tagSearchTerm}".</p>
                  ) : null}
                </div>
              </div>

              {/* Trade Table */}
              <div>
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
