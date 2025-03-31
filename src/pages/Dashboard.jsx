import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";

// New Components (to be created)
import StatCard from "../components/StatCard";
import FilterDrawer from "../components/FilterDrawer";
import ZellaScore from "../components/ZellaScore";
import DailyPnLChart from "../components/DailyPnLChart";
import CumulativePnLChart from "../components/CumulativePnLChart";
import CalendarWidget from "../components/CalendarWidget";
import TradeTable from "../components/TradeTable";
import ErrorBoundary from "../components/ErrorBoundary";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [trades, setTrades] = useState([]);
  const [filters, setFilters] = useState({ timeframe: "all", result: "all", tag: "" });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch trades in real-time
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const q = query(collection(db, "users", user.uid, "trades"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradeData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrades(tradeData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching trades:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter trades based on filters
  const filteredTrades = trades.filter((trade) => {
    let matches = true;
    if (filters.result !== "all") {
      matches = matches && trade.result.toLowerCase() === filters.result;
    }
    if (filters.tag) {
      matches = matches && trade.tags?.includes(filters.tag);
    }
    // Add timeframe filtering logic if needed
    return matches;
  });

  // Calculate stats
  const netPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const wins = filteredTrades.filter((t) => t.result === "Win");
  const losses = filteredTrades.filter((t) => t.result === "Loss");
  const totalTrades = filteredTrades.length;
  const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
  const dayWinRate = totalTrades ? (filteredTrades.filter((t) => t.pnl >= 0).length / totalTrades) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0;
  const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * Math.abs(avgLoss));
  const currentTradeStreak = filteredTrades.reduce((streak, trade) => {
    if (trade.result === "Win") return streak + 1;
    return 0;
  }, 0);
  const maxDrawdown = filteredTrades.length ? Math.min(...filteredTrades.map((t) => t.pnl)) : 0;
  const avgDrawdown = losses.length ? losses.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / losses.length : 0;
  const zellaScore = Math.min(100, (winRate * 0.4 + (netPnL > 0 ? 30 : 0) + (expectancy > 0 ? 30 : 0))); // Simplified formula

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 p-6 font-inter">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center max-w-7xl mx-auto mb-6">
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
        </header>

        <div className="max-w-7xl mx-auto">
          <FilterDrawer onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })} />

          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard
                  title="Net P&L"
                  value={`$${netPnL.toFixed(2)}`}
                  color={netPnL >= 0 ? "text-green-600" : "text-red-600"}
                  tooltip="Sum of profits - losses"
                />
                <StatCard title="Total Trades" value={totalTrades} color="text-blue-600" />
                <StatCard title="Trade Win %" value={`${winRate.toFixed(2)}%`} color="text-blue-600" />
                <StatCard title="Day Win %" value={`${dayWinRate.toFixed(2)}%`} color="text-blue-600" />
                <StatCard title="Avg Win Trade" value={`$${avgWin.toFixed(2)}`} color="text-green-600" />
                <StatCard title="Avg Loss Trade" value={`$${avgLoss.toFixed(2)}`} color="text-red-600" />
                <StatCard
                  title="Trade Expectancy"
                  value={`$${expectancy.toFixed(2)}`}
                  tooltip="(Win % * Avg Win) - (Loss % * Avg Loss)"
                />
                <StatCard title="Current Trade Streak" value={currentTradeStreak} color="text-green-600" />
                <StatCard title="Max Drawdown" value={`$${maxDrawdown.toFixed(2)}`} color="text-red-600" />
                <StatCard title="Avg Drawdown" value={`$${avgDrawdown.toFixed(2)}`} color="text-red-600" />
                <ZellaScore score={zellaScore} />
              </div>

              {/* Calendar and Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <CalendarWidget trades={filteredTrades} />
                <DailyPnLChart trades={filteredTrades} />
                <CumulativePnLChart trades={filteredTrades} />
              </div>

              {/* Trade Table */}
              <div>
                {(filters.result !== "all" || filters.tag) && (
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Showing: {filters.result !== "all" ? filters.result : ""}{" "}
                    {filters.tag ? `(${filters.tag} trades)` : ""}
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
