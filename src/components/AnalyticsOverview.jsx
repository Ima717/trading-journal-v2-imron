import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { filterTradesByDate } from "../utils/filterUtils";
import ChartTagPerformance from "../components/ChartTagPerformance";
import SearchFilter from "./SearchFilter";
import TagSummary from "./TagSummary";
import ResultFilter from "./ResultFilter";

const AnalyticsOverview = () => {
  const { user } = useAuth();
  const {
    dateRange,
    selectedTag,
    setSelectedTag,
    searchTerm,
    setSearchTerm,
    resultFilter,
  } = useFilters();

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

  useEffect(() => {
    let result = filterTradesByDate(trades, dateRange);

    if (selectedTag) {
      result = result.filter((t) => t.tags?.includes(selectedTag));
    }

    if (resultFilter !== "all") {
      result = result.filter((t) => t.result === resultFilter);
    }

    setFilteredTrades(result);
  }, [selectedTag, trades, dateRange, resultFilter]);

  const tagStats = {};
  const dateFiltered = filterTradesByDate(trades, dateRange).filter(
    (t) => resultFilter === "all" || t.result === resultFilter
  );

  dateFiltered.forEach((trade) => {
    const { pnl, tags = [] } = trade;
    tags.forEach((tag) => {
      if (!tagStats[tag]) {
        tagStats[tag] = { totalPnL: 0, count: 0 };
      }
      tagStats[tag].totalPnL += Number(pnl);
      tagStats[tag].count += 1;
    });
  });

  const tagChartData = Object.entries(tagStats)
    .filter(([tag]) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(([tag, stats]) => ({
      tag,
      avgPnL: stats.totalPnL / stats.count,
    }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-zinc-800 mb-4">Analytics Overview</h2>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTag={selectedTag}
        onClear={() => {
          setSelectedTag(null);
          setSearchTerm("");
        }}
      />

      <ResultFilter />

      <div className="bg-white shadow rounded-xl p-4">
        <ChartTagPerformance
          data={tagChartData}
          onTagClick={(tag) => setSelectedTag(tag)}
        />
      </div>

      {selectedTag && <TagSummary tag={selectedTag} trades={filteredTrades} />}

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-xl font-semibold mb-3">Filtered Trades</h3>
        {filteredTrades.length === 0 ? (
          <p className="text-gray-500 text-sm">No trades found.</p>
        ) : (
          <div className="overflow-x-auto">
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
                    <td className="p-2 whitespace-nowrap">{trade.symbol}</td>
                    <td className="p-2 whitespace-nowrap">{trade.date}</td>
                    <td className={`p-2 whitespace-nowrap ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ${trade.pnl}
                    </td>
                    <td className="p-2 capitalize whitespace-nowrap">{trade.result}</td>
                    <td className="p-2 text-gray-600 whitespace-nowrap">{trade.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsOverview;
