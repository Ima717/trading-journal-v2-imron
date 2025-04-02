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
import CalendarWidget from "../components/CalendarWidget";
import StatCard from "../components/StatCard";
import AvgWinLoss from "../components/AvgWinLoss";
import DayWinCard from "../components/DayWinCard";
import { getPnLOverTime, getZellaScoreOverTime } from "../utils/calculations";
import ErrorBoundary from "../components/ErrorBoundary";
import ChartEquityCurve from "../components/ChartEquityCurve";
import ChartSymbolDistribution from "../components/ChartSymbolDistribution";
import ChartPnLBySymbol from "../components/ChartPnLBySymbol";
import AdvancedFilters from "../components/AdvancedFilters";
import DateRangePicker from "../components/DateRangePicker";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    dateRange,
    setDateRange,
    resultFilter,
    setResultFilter,
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
    if (!dateRange.start || !dateRange.end) return null;
    const start = dayjs(dateRange.start).format("YYYY-MM-DD");
    const end = dayjs(dateRange.end).format("YYYY-MM-DD");
    return `Analytics from ${start} till ${end}`;
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

        const formatted = Object.entries(tagMap).map(([tag, val]) => ({
          tag,
          avgPnL: parseFloat((val.totalPnL / val.count).toFixed(2)),
        }));

        setTagPerformanceData(formatted);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching trades:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleTagClick = (tag) => {
    setClickedTag(tag);
    setResultFilter("all");
  };

  const filteredByDate = filteredTrades.filter((trade) => {
    if (!dateRange.start || !dateRange.end) return true;
    const tradeDate = dayjs(trade.date);
    return tradeDate.isAfter(dayjs(dateRange.start).subtract(1, "day")) &&
      tradeDate.isBefore(dayjs(dateRange.end).add(1, "day"));
  });

  const netPnL = filteredByDate.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalTrades = filteredByDate.length;
  const wins = filteredByDate.filter((t) => t.pnl > 0);
  const losses = filteredByDate.filter((t) => t.pnl < 0);
  const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
  const tradingDays = [...new Set(filteredByDate.map((t) => t.date))];
  const winningDays = tradingDays.filter((day) => {
    const dayPnL = filteredByDate.filter((t) => t.date === day).reduce((sum, t) => sum + t.pnl, 0);
    return dayPnL > 0;
  });
  const dayWinPercent = tradingDays.length ? (winningDays.length / tradingDays.length) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length)
    : 0;
  const profitFactor = losses.length
    ? wins.reduce((s, t) => s + t.pnl, 0) / Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
    : 0;

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
        <div className="max-w-screen-xl mx-auto px-4 py-6 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-2">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-1 sm:mb-0">
              📊 Welcome to IMAI Dashboard
            </h1>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <DateRangePicker />
              <AdvancedFilters />
            </div>
          </div>

          {dateRange.start && dateRange.end && (
            <p className="text-sm text-gray-500 mb-4">
              {formatDateRange()}
            </p>
          )}

          {isLoading ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading dashboard...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard title="Net P&L" value={`$${netPnL.toFixed(2)}`} color={netPnL >= 0 ? "text-green-600" : "text-red-500"} badge={totalTrades} tooltip="Total net profit/loss across all trades." />
                <StatCard title="Trade Win %" value={`${winRate.toFixed(2)}%`} customBg={getWinRateBackground()} tooltip="Winning trades vs total trades." />
                <StatCard title="Profit Factor" value={profitFactor.toFixed(2)} tooltip="Gross profit / gross loss.">{donut}</StatCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <DayWinCard />
                <AvgWinLoss />
              </div>

              <div className="mb-6">
                <ChartZellaScore data={zellaTrendData} />
              </div>
              <div className="mb-6">
                <ChartEquityCurve />
              </div>
              <div className="mb-6">
                <CalendarWidget />
              </div>
              <div className="mb-6">
                <ChartSymbolDistribution />
              </div>
              <div className="mb-6">
                <ChartPnLBySymbol />
              </div>

              <div className="mb-6">
                {tagPerformanceData.length > 0 ? (
                  <ChartTagPerformance data={tagPerformanceData} onTagClick={handleTagClick} />
                ) : null}
              </div>

              <div className="mb-6">
                <TradeTabs filteredTrades={filteredByDate} />
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
