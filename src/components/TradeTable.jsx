import React from "react";

const TradeTable = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 mt-10">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No trades found for this filter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 mt-10 overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Trades</h3>
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-zinc-800 text-left">
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Symbol</th>
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Date</th>
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">PnL</th>
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Result</th>
            <th className="p-2 font-medium text-zinc-700 dark:text-zinc-200">Notes</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, i) => (
            <tr
              key={i}
              className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <td className="p-2 text-zinc-800 dark:text-zinc-100">{trade.symbol}</td>
              <td className="p-2 text-zinc-800 dark:text-zinc-100">{trade.date}</td>
              <td
                className={`p-2 ${
                  trade.pnl >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                ${trade.pnl}
              </td>
              <td className="p-2 capitalize text-zinc-800 dark:text-zinc-100">{trade.result}</td>
              <td className="p-2 text-zinc-600 dark:text-zinc-300">{trade.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTable;
