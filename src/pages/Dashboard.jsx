import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import TradeTable from "../components/TradeTable";
import AnalyticsOverview from "../components/AnalyticsOverview";
import TagPerformanceChart from "../components/TagPerformanceChart"; // ✅ NEW

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
      <div className="flex justify-between items-center max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Log Out
        </button>
      </div>

      <AnalyticsOverview />
      <TagPerformanceChart /> {/* ✅ Inserted chart below the analytics */}
      <TradeTable />
    </div>
  );
};

export default Dashboard;
