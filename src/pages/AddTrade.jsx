import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const AddTrade = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    symbol: "",
    date: "",
    result: "win",
    pnl: "",
    tags: "",
    notes: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be signed in.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "trades"), {
        ...formData,
        pnl: parseFloat(formData.pnl),
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        createdAt: new Date(),
      });
      navigate("/"); // redirect to dashboard
    } catch (err) {
      console.error("Error adding trade:", err);
      setError("Failed to save trade.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Add Trade</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <input
          name="symbol"
          placeholder="Symbol (e.g., AAPL)"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={formData.symbol}
          onChange={handleChange}
          required
        />

        <input
          name="date"
          type="date"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <select
          name="result"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={formData.result}
          onChange={handleChange}
        >
          <option value="win">Win</option>
          <option value="loss">Loss</option>
        </select>

        <input
          name="pnl"
          type="number"
          placeholder="Profit / Loss"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={formData.pnl}
          onChange={handleChange}
          required
        />

        <input
          name="tags"
          placeholder="Tags (comma separated)"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={formData.tags}
          onChange={handleChange}
        />

        <textarea
          name="notes"
          placeholder="Notes"
          className="w-full mb-4 px-3 py-2 border rounded"
          value={formData.notes}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Trade
        </button>
      </form>
    </div>
  );
};

export default AddTrade;
