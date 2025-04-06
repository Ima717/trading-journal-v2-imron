import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { useTheme } from "../context/ThemeContext";
import dayjs from "dayjs";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { motion } from "framer-motion";

import TradeTabs from "../components/TradeTabs";
import ChartTagPerformance from "../components/ChartTagPerformance";
import ChartZellaScore from "../components/ChartZellaScore";
import StatCard from "../components/StatCard";
import ChartEquityCurve from "../components/ChartEquityCurve";
import ChartSymbolDistribution from "../components/ChartSymbolDistribution";
import ChartPnLBySymbol from "../components/ChartPnLBySymbol";
import AdvancedFilters from "../components/AdvancedFilters";
import TimelineDateRangePicker from "../components/TimelineDateRangePicker";
import WinStatsCard from "../components/WinStatsCard";
import ChartCard from "../components/ChartCard";
import DrawdownCard from "../components/DrawdownCard";
import CalendarCard from "../components/CalendarCard";
import RecentTradesCard from "../components/RecentTradesCard";
import ErrorBoundary from "../components/ErrorBoundary";

import { getPnLOverTime, getZellaScoreOverTime } from "../utils/calculations";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { dateRange, filteredTrades } = useFilters();

  const [tagPerformanceData, setTagPerformanceData] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [zellaTrendData, setZellaTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is signed in
  if (!user) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Please sign in to view your dashboard.</div>;

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const q = query(collection(db, "users", user.uid, "trades"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let trades = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      console.log("Signed in user:", user); // Verify the real user

      if (dateRange.start && dateRange.end) {
        const start = dayjs(dateRange.start);
        const end = dayjs(dateRange.end);
        trades = trades.filter(
          (t) =>
            dayjs(t.date).isAfter(start.subtract(1, "day")) &&
            dayjs(t.date).isBefore(end.add(1, "day"))
        );
      }

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

      const formatted = Object.entries(tagMap).map(([tag, val]) => ({
        tag,
        avgPnL: parseFloat((val.totalPnL / val.count).toFixed(2)),
      }));

      setTagPerformanceData(formatted);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, dateRange]);

  const netPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter((t) => t.pnl > 0);
  const losses = filteredTrades.filter((t) => t.pnl < 0);
  const winRate = totalTrades ? ((wins.length / totalTrades) * 100).toFixed(2) : "0.00";

  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length)
    : 0;
  const profitFactor = losses.length
    ? (wins.reduce((s, t) => s + t.pnl, 0) / Math.abs(losses.reduce((s, t) => s + t.pnl, 0))).toFixed(2)
    : "0.00";

  const tradingDays = [...new Set(filteredTrades.map((t) => t.date))];
  const winningDays = tradingDays.filter((day) => {
    const dayPnL = filteredTrades
      .filter((t) => t.date === day)
      .reduce((sum, t) => sum + t.pnl, 0);
    return dayPnL > 0;
  });
  const dayWinPercent = tradingDays.length
    ? ((winningDays.length / tradingDays.length) * 100).toFixed(2)
    : "0.00";

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

  const cumulativePnl = [];
  let runningPnl = 0;
  filteredTrades
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((t) => {
      runningPnl += t.pnl || 0;
      cumulativePnl.push(runningPnl);
    });

  const peak = Math.max(...cumulativePnl, 0);
  const trough = Math.min(...cumulativePnl, 0);
  const maxDrawdown = trough;
  const recoveryFactor = peak !== 0 ? Math.abs(peak / trough) : 0;

  const getWinRateBackground = () => {
    if (winRate > 60) return "bg-gradient-to-r from-green-400 to-green-500 text-white";
    if (winRate >= 40) return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white";
    return "bg-gradient-to-r from-red-400 to-red-500 text-white";
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-inter">
        <div className="max-w-screen-xl mx-auto px-4 py-6 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-3">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2 sm:mb-0">
              Welcome to IMAI Dashboard
            </h1>
            <div className="flex gap-3">
              <TimelineDateRangePicker />
              <AdvancedFilters />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              Loading dashboard...
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard
                  title="Net P&L"
                  value={`$${netPnL.toFixed(2)}`}
                  color={netPnL >= 0 ? "text-green-600" : "text-red-500"}
                  badge={totalTrades}
                  tooltip="Total net profit/loss across all trades."
                />
                <StatCard
                  title="Trade Win %"
                  value={`${winRate}%`}
                  customBg={getWinRateBackground()}
                  tooltip="Winning trades vs total trades."
                />
                <StatCard title="Profit Factor" value={profitFactor} tooltip="Gross profit / gross loss.">
                  {donut}
                </StatCard>
              </div>

              <div className="mb-6">
                <WinStatsCard />
              </div>

              {/* Animated Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
                <motion.div whileHover={{ y: -4, scale: 1.015 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="h-full">
                  <ChartCard title="Zella Score">
                    <ChartZellaScore data={zellaTrendData} />
                  </ChartCard>
                </motion.div>

                <motion.div whileHover={{ y: -4, scale: 1.015 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="h-full">
                  <ChartCard title="Equity Curve">
                    <ChartEquityCurve data={pnlData} />
                  </ChartCard>
                </motion.div>

                <motion.div whileHover={{ y: -4, scale: 1.015 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="h-full">
                  <ChartCard>
                    <DrawdownCard
                      maxDrawdown={maxDrawdown}
                      recoveryFactor={recoveryFactor}
                      data={pnlData}
                    />
                  </ChartCard>
                </motion.div>
              </div>

              {/* Calendar & Trade History Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
                <div className="lg:col-span-2 h-full">
                  <CalendarCard trades={filteredTrades} />
                </div>
                <div className="h-full">
                  {console.log("Filtered Trades:", filteredTrades)}
                  <RecentTradesCard trades={filteredTrades} />
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartCard title="Symbol Distribution">
                  <ChartSymbolDistribution />
                </ChartCard>
                <ChartCard title="PnL by Symbol">
                  <ChartPnLBySymbol />
                </ChartCard>
              </div>

              {tagPerformanceData.length > 0 && (
                <div className="mb-6">
                  <ChartCard title="Tag Performance">
                    <ChartTagPerformance data={tagPerformanceData} />
                  </ChartCard>
                </div>
              )}

              <div className="mb-6">
                <ChartCard title="Trades Table">
                  <TradeTabs filteredTrades={filteredTrades} />
                </ChartCard>
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
