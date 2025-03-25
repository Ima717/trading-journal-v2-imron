import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const SummaryCards = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalPnL: 0,
    winRate: 0,
    avgPnL: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const trades = snapshot.docs.map((doc) => doc.data());

      const totalTrades = trades.length;
      const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const wins = trades.filter((t) => t.result === "win").length;
      const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;
      const avgPnL = totalTrades > 0 ? (totalPnL / totalTrades).toFixed(2) : 0;

      setStats({
        totalTrades,
        totalPnL,
        winRate,
        avgPnL,
      });
    };

    fetchStats();
  }, [user]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
        <h3 className="text-sm font-medium text-gray-500">Total Trades</h3>
        <p className="text-2xl font-bold">{stats.totalTrades}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <h3 className="text-sm font-medium text-gray-500">Total PnL</h3>
        <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? "text-green-700" : "text-red-600"}`}>
          ${stats.totalPnL}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-400">
        <h3 className="text-sm font-medium text-gray-500">Win Rate</h3>
        <p className="text-2xl font-bold">{stats.winRate}%</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <h3 className="text-sm font-medium text-gray-500">Average PnL</h3>
        <p className="text-2xl font-bold">${stats.avgPnL}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
