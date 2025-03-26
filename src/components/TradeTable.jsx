import React from "react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const TradeTable = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return <p className="text-center mt-4">No trades yet. Start by adding one!</p>;
  }

  return (
    <div className="overflow-x-auto mt-6 w-full max-w-4xl mx-auto">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-200 text-gray-700 text-left text-sm">
            <th className="px-4 py-2">Symbol</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">PnL</th>
            <th className="px-4 py-2">Result</th>
            <th className="px-4 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={index} className="border-t text-sm">
              <td className="px-4 py-2">{trade.symbol}</td>
              <td className="px-4 py-2">{trade.date}</td>
              <td className="px-4 py-2">${trade.pnl}</td>
              <td className="px-4 py-2 capitalize">{trade.result}</td>
              <td className="px-4 py-2 text-gray-600">{trade.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTable;
