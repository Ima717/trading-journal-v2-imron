import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate, Link } from "react-router-dom";

import AnalyticsOverview from "../components/AnalyticsOverview";
import TradeTable from "../components/TradeTable";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
        <div className="space-x-3">
  {/* ✅ Calendar Button */}
  <Link
    to="/calendar"
    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
  >
    📅 Calendar
  </Link>

  {/* 🧪 Test Button */}
  <Link
    to="/test"
    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
  >
    🧪 Test
  </Link>

  {/* ➕ Add Trade Button */}
  <Link
    to="/add-trade"
    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
  >
    ➕ Add Trade
  </Link>

  {/* 🔒 Logout Button */}
  <button
    onClick={handleLogout}
    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
  >
    Log Out
  </button>
</div>

      </div>

      <AnalyticsOverview />
      <TradeTable />
    </div>
  );
};

export default Dashboard;
