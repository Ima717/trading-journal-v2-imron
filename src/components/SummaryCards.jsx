import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const SummaryCards = () => {
  const { user } = useAuth();
  const [totalTrades, setTotalTrades] = useState(0);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      setTotalTrades(snapshot.size);
    };

    fetchTrades();
  }, [user]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
        <h3 className="text-sm font-medium text-gray-500">Total Trades</h3>
        <p className="text-2xl font-bold text-gray-900">{totalTrades}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
