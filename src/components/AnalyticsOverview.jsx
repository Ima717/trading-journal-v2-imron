import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const AnalyticsOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    wins: 0,
    losses: 0,
    netPnl: 0,
    winRate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const snapshot = await getDocs(
        collection(db, "users", user.uid, "trades")
      );

      let wins = 0;
      let losses = 0;
      let netPnl = 0;

      snapshot.forEach((doc) => {
        const trade = doc.data();
        if (trade.result === "win") wins++;
        else if (trade.result === "loss") losses++;

        netPnl += Number(trade.pnl || 0);
      });

      const total = wins + losses;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

      setStats({ total, wins, losses, netPnl, winRate });
    };

    fetchStats();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
      <div className="bg-white p-4 shadow rounded">
        <h4 className="text-gray-500 text-sm">Total Trades</h4>
        <p className="text-xl font-semibold">{stats.total}</p>
      </div>
      <div className="bg-white p-4 shadow rounded">
        <h4 className="text-gray-500 text-sm">Win Rate</h4>
        <p className="text-xl font-semibold">{stats.winRate}%</p>
      </div>
      <div className="bg-white p-4 shadow rounded">
        <h4 className="text-gray-500 text-sm">Net PnL</h4>
        <p className={`text-xl font-semibold ${stats.netPnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          ${stats.netPnl}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
