import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const TagPerformanceChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const tradesRef = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(tradesRef);
      const trades = snapshot.docs.map(doc => doc.data());

      const tagStats = {};

      trades.forEach((trade) => {
        const { pnl, tags = [] } = trade;

        tags.forEach((tag) => {
          if (!tagStats[tag]) {
            tagStats[tag] = { totalPnL: 0, count: 0 };
          }
          tagStats[tag].totalPnL += Number(pnl);
          tagStats[tag].count += 1;
        });
      });

      const chartData = Object.entries(tagStats).map(([tag, stats]) => ({
        tag,
        avgPnL: stats.totalPnL / stats.count,
      }));

      setData(chartData);
    };

    fetchTrades();
  }, [user]);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-3xl mx-auto mb-8">
      <h2 className="text-xl font-semibold mb-4 text-center">Tag Performance (Avg PnL)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="tag" type="category" />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgPnL" fill="#4F46E5" name="Avg PnL" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TagPerformanceChart;
