// /src/components/PerformanceByTag.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";

const PerformanceByTag = () => {
  const { filteredTrades } = useFilters();

  const tagPerformance = {};
  filteredTrades.forEach((trade) => {
    if (Array.isArray(trade.tags)) {
      trade.tags.forEach((tag) => {
        if (!tagPerformance[tag]) {
          tagPerformance[tag] = { totalPnL: 0, wins: 0, total: 0 };
        }
        tagPerformance[tag].totalPnL += trade.pnl || 0;
        tagPerformance[tag].total += 1;
        if (trade.pnl > 0) {
          tagPerformance[tag].wins += 1;
        }
      });
    }
  });

  const formatted = Object.entries(tagPerformance).map(([tag, data]) => ({
    tag,
    totalPnL: data.totalPnL.toFixed(2),
    winRate: data.total ? ((data.wins / data.total) * 100).toFixed(2) : 0,
  }));

  return (
    <div className="bg-white shadow rounded-xl p-4 animate-fade-in">
      <h3 className="text-sm text-gray-600 mb-3">Performance by Tag</h3>
      {formatted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 font-medium">Tag</th>
                <th className="p-2 font-medium">Total P&L</th>
                <th className="p-2 font-medium">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {formatted.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-2 whitespace-nowrap">{item.tag}</td>
                  <td className={`p-2 whitespace-nowrap ${item.totalPnL >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    ${item.totalPnL}
                  </td>
                  <td className="p-2 whitespace-nowrap">{item.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No tags available.</p>
      )}
    </div>
  );
};

export default PerformanceByTag;
