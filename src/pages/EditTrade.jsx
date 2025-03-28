// /src/pages/EditTrade.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";

const EditTrade = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useFilters();
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [formData, setFormData] = useState({
    symbol: "",
    date: "",
    pnl: "",
    tags: "",
    notes: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrade = async () => {
      if (!user || !id) return;
      try {
        const tradeRef = doc(db, "users", user.uid, "trades", id);
        const tradeSnap = await getDoc(tradeRef);
        if (tradeSnap.exists()) {
          const data = tradeSnap.data();
          setTrade(data);
          setFormData({
            symbol: data.symbol || "",
            date: data.date || "",
            pnl: data.pnl || "",
            tags: data.tags ? data.tags.join(", ") : "",
            notes: data.notes || "",
          });
      } catch (err) {
        console.error("Error fetching trade:", err);
        setError("Failed to load trade. Please try again.");
      }
    };

    fetchTrade();
  }, [user, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !id) return;

    try {
      const tradeRef = doc(db, "users", user.uid, "trades", id);
      await updateDoc(tradeRef, {
        symbol: formData.symbol,
        date: formData.date,
        pnl: parseFloat(formData.pnl) || 0,
        result: parseFloat(formData.pnl) >= 0 ? "win" : "loss",
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        notes: formData.notes,
      });
      triggerRefresh(); // Refresh dashboard data after update
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating trade:", err);
      setError("Failed to update trade. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">Edit Trade</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">P&L</label>
              <input
                type="number"
                name="pnl"
                value={formData.pnl}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTrade;
