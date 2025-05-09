import React, { useEffect, useState, useMemo } from "react";
import { auth, db } from "../utils/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { useTheme } from "../context/ThemeContext";
import dayjs from "dayjs";
import { motion } from "framer-motion";

import TradeTabs from "../components/TradeTabs";
import ChartTagPerformance from "../components/ChartTagPerformance";
import ChartZellaScore from "../components/ChartZellaScore";
import NetPLCard from "../components/NetPLCard";
import ProfitFactorCard from "../components/ProfitFactorCard";
import TradeWinPercentCard from "../components/TradeWinPercentCard";
import AvgWinLossCard from "../components/AvgWinLossCard";
import DayWinPercentCard from "../components/DayWinPercentCard";
import ChartEquityCurve from "../components/ChartEquityCurve";
import ChartSymbolDistribution from "../components/ChartSymbolDistribution";
import ChartPnLBySymbol from "../components/ChartPnLBySymbol";
import AdvancedFilters from "../components/AdvancedFilters";
import TimelineDateRangePicker from "../components/TimelineDateRangePicker";
import ChartCard from "../components/ChartCard";
import DrawdownCard from "../components/DrawdownCard";
import CalendarCard from "../components/CalendarCard";
import RecentTradesCard from "../components/RecentTradesCard";
import ErrorBoundary from "../components/ErrorBoundary";

import { getPnLOverTime, getZellaScoreOverTime, getMaxDrawdown, getRecoveryFactor } from "../utils/calculations";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { dateRange, filteredTrades } = useFilters();

  const [localTrades, setLocalTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!user)
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Please sign in to view your dashboard.
      </div>
    );

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, "users", user.uid, "trades"),
      orderBy("entryTime", "asc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const trades = snapshot.docs.map((doc) => {
          const data = doc.data();
          const amount = parseFloat(data.amount) || 0;
          const commission = parseFloat(data.commission) || 0;
          const fees = parseFloat(data.fees) || 0;
          const pnl = parseFloat(data.pnl) || 0;
          return {
            id: doc.id,
            ...data,
            entryTime: data.entryTime || data.date || new Date().toISOString(),
            date: data.entryTime || data.date,
            amount,
            commission,
            fees,
            pnl,
          };
        });

        let finalTrades = trades;
        if (dateRange.start && dateRange.end) {
          const start = dayjs(dateRange.start);
          const end = dayjs(dateRange.end);
          finalTrades = trades.filter((t) => {
            const entryTime = dayjs(t.entryTime);
            return (
              entryTime.isValid() &&
              entryTime.isAfter(start.subtract(1, "day")) &&
              entryTime.isBefore(end.add(1, "day"))
            );
          });
        }

        setLocalTrades(finalTrades);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore fetch error:", error);
        setError("Failed to load trades. Please try again later.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, dateRange]);

  const displayTrades = useMemo(() => {
    return filteredTrades.length > 0 && filteredTrades.every((t) => t.pnl !== undefined)
      ? filteredTrades
      : localTrades;
  }, [filteredTrades, localTrades]);

  const pnlData = useMemo(() => getPnLOverTime(displayTrades), [displayTrades]);
  const zellaTrendData = useMemo(() => getZellaScoreOverTime(displayTrades), [displayTrades]);
  const tagPerformanceData = useMemo(() => {
    const tagMap = {};
    displayTrades.forEach((trade) => {
      if (Array.isArray(trade.tags)) {
        trade.tags.forEach((tag) => {
          if (!tagMap[tag]) tagMap[tag] = { totalPnL: 0, count: 0 };
          tagMap[tag].totalPnL += trade.pnl || 0;
          tagMap[tag].count += 1;
        });
      }
    });
    return Object.entries(tagMap).map(([tag, val]) => ({
      tag,
      avgPnL: parseFloat((val.totalPnL / val.count).toFixed(2)),
    }));
  }, [displayTrades]);

  // Core Metrics
  const totalTrades = displayTrades.length;
  const wins = displayTrades.filter((t) => t.pnl > 0);
  const losses = displayTrades.filter((t) => t.pnl < 0);

  // Trade Win %
  const tradeWinPercent = totalTrades
    ? ((wins.length / totalTrades) * 100).toFixed(2)
    : "0.00";

  // Profit Factor
  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalTrades
    ? grossLoss > 0
      ? (grossProfit / grossLoss).toFixed(2)
      : grossProfit > 0
      ? "Infinity"
      : "0.00"
    : "0.00";

  // Avg Win/Loss Trade
  const avgWin = wins.length ? grossProfit / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  const avgWinLossTrade = wins.length && losses.length
    ? (avgWin / avgLoss).toFixed(2)
    : wins.length
    ? "Infinity"
    : losses.length
    ? "0.00"
    : "N/A";

  // Day Win %
  const tradingDays = [
    ...new Set(
      displayTrades
        .map((t) =>
          dayjs(t.entryTime).isValid()
            ? dayjs(t.entryTime).format("YYYY-MM-DD")
            : null
        )
        .filter((day) => day !== null)
    ),
  ];
  const winningDays = tradingDays.filter((day) => {
    const dayPnL = displayTrades
      .filter((t) => dayjs(t.entryTime).format("YYYY-MM-DD") === day)
      .reduce((sum, t) => sum + (t.pnl || 0), 0);
    return dayPnL > 0;
  });
  const dayWinPercent = tradingDays.length
    ? ((winningDays.length / tradingDays.length) * 100).toFixed(2)
    : "0.00";

  // Other Calculations
  const netPnL = displayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const maxDrawdown = getMaxDrawdown(displayTrades);
  const recoveryFactor = getRecoveryFactor(displayTrades);

  const getWinRateBackground = () => {
    const winRateValue = parseFloat(tradeWinPercent);
    if (winRateValue > 60)
      return "bg-gradient-to-r from-green-400 to-green-500 text-white";
    if (winRateValue >= 40)
      return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white";
    return "bg-gradient-to-r from-red-400 to-red-500 text-white";
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-inter">
        <div className="max-w-screen-xl mx-auto px-4 py-6 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-3">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2 sm:mb-0">
              Welcome to IMAI Dashboard
            </h1>
            <div className="flex gap-3">
              <TimelineDateRangePicker />
              <AdvancedFilters />
            </div>
          </div>

          {error ? (
            <div className="text-center py-10 text-red-500 dark:text-red-400">{error}</div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
              <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-gray-500 dark:border-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* First Row: 3 Widgets */}
              <div className="flex flex-wrap gap-6 mb-6 w-full justify-between">
                <NetPLCard
                  value={netPnL}
                  badge={totalTrades}
                  trades={displayTrades}
                />
                <TradeWinPercentCard
                  value={tradeWinPercent}
                  customBg={getWinRateBackground()}
                />
                <ProfitFactorCard
                  value={profitFactor}
                  trades={displayTrades}
                />
              </div>

              {/* Second Row: 2 Widgets */}
              <div className="flex flex-wrap gap-6 mb-6 w-full justify-between">
                <AvgWinLossCard value={avgWinLossTrade} />
                <DayWinPercentCard value={dayWinPercent} trades={displayTrades} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
                <motion.div
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="h-full"
                >
                  <ChartCard title="Zella Score">
                    <ChartZellaScore data={zellaTrendData} />
                  </ChartCard>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="h-full"
                >
                  <ChartCard title="Equity Curve">
                    <ChartEquityCurve data={pnlData} />
                  </ChartCard>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="h-[300px]"
                >
                  <ChartCard>
                    <DrawdownCard
                      maxDrawdown={maxDrawdown}
                      recoveryFactor={recoveryFactor}
                      data={pnlData}
                    />
                  </ChartCard>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
                <div className="lg:col-span-2 h-full">
                  <CalendarCard trades={displayTrades} />
                </div>
                <div className="h-full">
                  <RecentTradesCard trades={displayTrades} />
                </div>
              </div>

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
                  <TradeTabs filteredTrades={displayTrades} />
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
