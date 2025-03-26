import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import ChartTagPerformance from "../components/ChartTagPerformance";
import SearchFilter from "./SearchFilter";
import TagSummary from "./TagSummary";

const AnalyticsOverview = () => {
  const { user } = useAuth();
  const { selectedTag, setSelectedTag, searchTerm, setSearchTerm } = useFilters();

  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);

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

  // ⏳ Re-filter trades based on selected tag
  useEffect(() => {
    if (selectedTag) {
      setFilteredTrades(trades.filter((trade) => trade.tags?.includes(selectedTag)));
    } else {
      setFilteredTrades(trades);
    }
  }, [selectedTag, trades]);

  // 📊 Generate tag stats from full list of trades
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

  // 🔍 Filter tag stats based on search input
  const tagChartData = Object.entries(tagStats)
    .filter(([tag]) =>
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(([tag, stats]) => ({
      tag,
      avgPnL: stats.totalPnL / stats.count,
    }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Analytics Overview</h2>

      {/* 🔍 Search input + selected tag info */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTag={selectedTag}
        onClear={() => {
          setSelectedTag(null);
          setSearchTerm("");
        }}
      />

      {/* 📈 Tag Chart */}
      <div className="bg-white shadow rounded p-4">
        <ChartTagPerformance
          data={tagChartData}
          onTagClick={(tag) => setSelectedTag(tag)}
        />
      </div>

      {/* 🧠 Optional tag summary */}
      {selectedTag && <TagSummary tag={selectedTag} trades={filteredTrades} />}

      {/* 📋 Filtered trade table */}
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
                  <td className={`p-2 ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    ${trade.pnl}
                  </td>
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
