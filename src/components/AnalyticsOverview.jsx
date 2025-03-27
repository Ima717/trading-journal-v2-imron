// /src/components/AnalyticsOverview.jsx (Latest)
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { filterTradesByDate } from "../utils/filterUtils";

const AnalyticsOverview = () => {
  const { user } = useAuth();
  const { dateRange, selectedTag, resultFilter } = useFilters();
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const fetched = snapshot.docs.map((doc) => doc.data());
      setTrades(fetched);
    };

    fetchTrades();
  }, [user]);

  const filteredTrades = React.useMemo(() => {
    let result = filterTradesByDate(trades, dateRange);

    if (selectedTag) {
      result = result.filter((t) => t.tags?.includes(selectedTag));
    }

    if (resultFilter !== "all") {
      result = result.filter((t) => t.result === resultFilter);
    }

    return result;
  }, [trades, dateRange, selectedTag, resultFilter]);

  const totalTrades = filteredTrades.length || 0;
  const winRate = totalTrades
    ? (filteredTrades.filter((t) => t.result === "Win").length / totalTrades) * 100
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
    <div className="bg-white shadow rounded-xl p-4">
      <h3 className="text-xl font-semibold mb-3">Overview</h3>
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
