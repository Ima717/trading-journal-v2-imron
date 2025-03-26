// components/RecentTradesTable.jsx
import React from 'react';

const RecentTradesTable = ({ trades }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4">
      <h2 className="text-md font-medium mb-3 text-zinc-800 dark:text-white">Recent Trades</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-zinc-700">
              <th className="p-2">Symbol</th>
              <th className="p-2">Date</th>
              <th className="p-2">PnL</th>
              <th className="p-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, idx) => (
              <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                <td className="p-2">{trade.symbol}</td>
                <td className="p-2">{trade.date}</td>
                <td className={`p-2 ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${trade.pnl}
                </td>
                <td className="p-2">{trade.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTradesTable;
