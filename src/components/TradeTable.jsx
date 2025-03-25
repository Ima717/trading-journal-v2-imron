import React from "react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const TradeTable = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const tradesRef = collection(db, "users", user.uid, "trades");
      const q = query(tradesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const fetchedTrades = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTrades(fetchedTrades);
      setLoading(false);
    };

    fetchTrades();
  }, [user]);

  if (loading) return <p className="text-center mt-4">Loading trades...</p>;

  if (trades.length === 0) {
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
          {trades.map((trade) => (
            <tr key={trade.id} className="border-t text-sm">
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
