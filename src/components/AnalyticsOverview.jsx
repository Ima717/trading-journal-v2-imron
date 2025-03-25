import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import TagPerformanceChart from "../components/ChartTagPerformance";

const AnalyticsOverview = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

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

  // Filter trades by selected tag
  useEffect(() => {
    if (selectedTag) {
      setFilteredTrades(
        trades.filter((trade) => trade.tags?.includes(selectedTag))
      );
    } else {
      setFilteredTrades(trades);
    }
  }, [selectedTag, trades]);

  // Prepare tag chart data
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

  const tagChartData = Object.entries(tagStats).map(([tag, stats]) => ({
    tag,
    avgPnL: stats.totalPnL / stats.count,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics Overview</h1>

      <ChartTagPerformance
        data={tagChartData}
        onTagClick={(tag) => setSelectedTag(tag)}
      />

      {selectedTag && (
        <div className="mb-4">
          <p className="text-sm">
            Showing trades with tag:{" "}
            <span className="font-semibold text-purple-600">{selectedTag}</span>
          </p>
          <button
            onClick={() => setSelectedTag(null)}
            className="mt-1 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear Tag Filter
          </button>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Filtered Trades</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Symbol</th>
              <th className="p-2">Date</th>
              <th className="p-2">PnL</th>
              <th className="p-2">Result</th>
              <th className="p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map((trade, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{trade.symbol}</td>
                <td className="p-2">{trade.date}</td>
                <td className="p-2">${trade.pnl}</td>
                <td className="p-2">{trade.result}</td>
                <td className="p-2 text-gray-600">{trade.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
