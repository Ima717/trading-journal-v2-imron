import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import ChartTagPerformance from "../components/ChartTagPerformance";

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

  useEffect(() => {
    if (selectedTag) {
      setFilteredTrades(
        trades.filter((trade) => trade.tags?.includes(selectedTag))
      );
    } else {
      setFilteredTrades(trades);
    }
  }, [selectedTag, trades]);

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
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Analytics Overview</h2>

      <div className="bg-white shadow rounded p-4">
        <ChartTagPerformance
          data={tagChartData}
          onTagClick={(tag) => setSelectedTag(tag)}
        />
      </div>

      {selectedTag && (
        <div className="flex items-center justify-between bg-purple-50 px-4 py-2 rounded shadow">
          <p className="text-sm">
            Filtering by tag: <span className="font-semibold text-purple-600">{selectedTag}</span>
          </p>
          <button
            onClick={() => setSelectedTag(null)}
            className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
          >
            Reset Filter
          </button>
        </div>
      )}

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-xl font-semibold mb-3">Filtered Trades</h3>
        {filteredTrades.length === 0 ? (
          <p className="text-gray-500 text-sm">No trades found for this tag.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 font-medium">Symbol</th>
                <th className="p-2 font-medium">Date</th>
                <th className="p-2 font-medium">PnL</th>
                <th className="p-2 font-medium">Result</th>
                <th className="p-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">{trade.symbol}</td>
                  <td className="p-2">{trade.date}</td>
                  <td className="p-2">${trade.pnl}</td>
                  <td className="p-2 capitalize">{trade.result}</td>
                  <td className="p-2 text-gray-600">{trade.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AnalyticsOverview;
