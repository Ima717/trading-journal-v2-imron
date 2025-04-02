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

        setTagPerformanceData(formatted);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching trades:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, dateRange, resultFilter]);

  const handleTagClick = (tag) => {
    setClickedTag(tag);
    setTagSearchTerm("");
    setResultFilter("all");
  };

  const netPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter((t) => t.pnl > 0);
  const losses = filteredTrades.filter((t) => t.pnl < 0);
  const winRate = totalTrades ? (wins.length / totalTrades.length) * 100 : 0;
  const tradingDays = [...new Set(filteredTrades.map((t) => t.date))];
  const winningDays = tradingDays.filter((day) => {
    const dayPnL = filteredTrades.filter((t) => t.date === day).reduce((sum, t) => sum + t.pnl, 0);
    return dayPnL > 0;
  });
  const dayWinPercent = tradingDays.length ? (winningDays.length / tradingDays.length) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((sum
