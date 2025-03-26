import React from "react";

const TradeTable = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return (
      <div className="bg-white shadow rounded p-4 mt-10">
        <p className="text-center text-gray-500">No trades found for this filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded p-4 mt-10 overflow-x-auto">
      <h3 className="text-xl font-semibold mb-3">Trades</h3>
      <table className="min-w-full text-sm border-collapse">
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
          {trades.map((trade, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="p-2">{trade.symbol}</td>
              <td className="p-2">{trade.date}</td>
              <td className={`p-2 ${trade.pnl >= 0 ? "text-green-600" : "text-red-500"}`}>
                ${trade.pnl}
              </td>
              <td className="p-2 capitalize">{trade.result}</td>
              <td className="p-2 text-gray-600">{trade.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTable;
