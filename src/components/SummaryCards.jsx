import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useFilters } from "../context/FilterContext";
import MetricCard from "./MetricCard";

const SummaryCards = () => {
  const { user } = useAuth();
  const { startDate, endDate } = useFilters();

  const [summary, setSummary] = useState({
    totalTrades: 0,
    totalPnL: 0,
    winRate: 0,
    avgPnL: 0,
  });

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const trades = snapshot.docs.map((doc) => doc.data());

      // 🔍 Filter trades by selected date range
      const filtered = trades.filter((t) => {
        const tradeDate = new Date(t.date);
        return (!startDate || tradeDate >= new Date(startDate)) &&
               (!endDate || tradeDate <= new Date(endDate));
      });

      const totalTrades = filtered.length;
      const totalPnL = filtered.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const wins = filtered.filter((t) => t.result === "win").length;
      const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;
      const avgPnL = totalTrades ? (totalPnL / totalTrades).toFixed(2) : 0;

      setSummary({
        totalTrades,
        totalPnL,
        winRate,
        avgPnL,
      });
    };

    fetchTrades();
  }, [user, startDate, endDate]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
      <MetricCard title="Total Trades" value={summary.totalTrades} />
      <MetricCard title="Total PnL" value={`$${summary.totalPnL}`} />
      <MetricCard title="Win Rate" value={`${summary.winRate}%`} />
      <MetricCard title="Avg PnL/Trade" value={`$${summary.avgPnL}`} />
    </div>
  );
};

export default SummaryCards;
