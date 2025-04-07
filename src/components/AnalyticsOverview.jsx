import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { filterTradesByDate } from "../utils/filterUtils";

const AnalyticsOverview = () => {
  const { user } = useAuth();
  const { dateRange, clickedTag, resultFilter } = useFilters();
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        const pnl = data.pnl !== undefined ? data.pnl : (data.side === "Buy" ? -(data.amount || 0) : (data.amount || 0)) - (data.commission || 0) - (data.fees || 0);
        return { ...data, pnl: Number.isNaN(pnl) ? 0 : pnl };
      });
      setTrades(fetched);
    };

    fetchTrades();
  }, [user]);

  const filteredTrades = React.useMemo(() => {
    let result = filterTradesByDate(trades, dateRange);

    if (clickedTag) {
      result = result.filter((t) => t.tags?.includes(clickedTag));
    }

    if (resultFilter !== "all") {
      result = result.filter((t) => (resultFilter === "Win" ? t.pnl > 0 : t.pnl <= 0));
    }

    return result;
  }, [trades, dateRange, clickedTag, resultFilter]);

  const totalTrades = filteredTrades.length || 0;
  const winRate = totalTrades
    ? (filteredTrades.filter((t) => t.pnl > 0).length / totalTrades) * 100
    : 0;
  const avgPnL = totalTrades
    ? filteredTrades.reduce((sum, t) => sum + Number(t.pnl), 0) / totalTrades
    : 0;

  const summaryStats = [
    { label: "Total Trades", value: totalTrades },
    { label: "Win Rate", value: `${winRate.toFixed(2)}%` },
    { label: "Avg PnL", value: `$${avgPnL.toFixed(2)}` },
  ];

  return (
    <div className="bg-blue-50 shadow rounded-xl p-4 animate-fade-in">
      <h3 className="text-xl font-semibold mb-3">Filtered Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryStats.map((stat, index) => (
          <div key={index} className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsOverview;
