// /src/pages/AddTrade.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";

const AddTrade = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useFilters();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    assetType: "option", // Changed from instrumentType to match schema
    symbol: "",
    entryPrice: "",
    exitPrice: "",
    entryTime: "", // New: ISO timestamp
    exitTime: "",  // New: ISO timestamp
    quantity: "",
    direction: "long", // New: long/short
    status: "closed",  // New: open/closed
    fees: "",
    commissions: "",
    pnl: 0, // Auto-calculated
    tags: "",
    notes: "",
    playbook: "",
    tradeRating: 0,
    optionDetails: {
      type: "call",
      strikePrice: "",
      expirationDate: "",
      legs: [{ type: "call", strikePrice: "", quantity: "" }],
    },
    futureDetails: {
      contractType: "",
      contractSize: "",
      margin: "",
    },
  });

  const symbols = [
    "SPY", "QQQ", "IWM", "AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "AMZN", "META",
    "JPM", "BAC", "WMT", "ES", "MES", "NQ", "MNQ", "YM", "MYM", "RTY", "M2K",
    "CL", "GC", "SI", "HG", "ZN", "ZB", "6E", "6J"
  ];

  const predefinedTags = [
    "Scalp", "Swing", "Day Trade", "Breakout", "Reversal", "News-based Trade", "Momentum",
    "Earnings Play", "Emotional Trade", "High Risk", "Premarket", "Afterhours", "Gap Fill",
    "Trend Following", "Mean Reversion", "Double Top", "Double Bottom", "Cup & Handle",
    "Head & Shoulders", "Inverse Head & Shoulders", "Triangle", "Flag", "Pennant", "Wedge",
    "Channel", "Mistake: Overtrading", "Mistake: Moved Stop Loss", "Mistake: Chasing",
    "Mistake: No Stop Loss", "Mistake: Overleveraged", "Mistake: FOMO"
  ];

  const playbooks = ["Breakout", "Pullback", "Reversal", "Scalping"];

  const futuresTickValues = {
    ES: { tickSize: 0.25, tickValue: 12.50 },
    MES: { tickSize: 0.25, tickValue: 1.25 },
    NQ: { tickSize: 0.25, tickValue: 5.00 },
    MNQ: { tickSize: 0.25, tickValue: 0.50 },
    YM: { tickSize: 1.0, tickValue: 5.00 },
    MYM: { tickSize: 1.0, tickValue: 0.50 },
    RTY: { tickSize: 0.10, tickValue: 5.00 },
    M2K: { tickSize: 0.10, tickValue: 0.50 },
    CL: { tickSize: 0.01, tickValue: 10.00 },
    GC: { tickSize: 0.10, tickValue: 10.00 },
    SI: { tickSize: 0.005, tickValue: 25.00 },
    HG: { tickSize: 0.0005, tickValue: 12.50 },
    ZN: { tickSize: 0.015625, tickValue: 15.625 },
    ZB: { tickSize: 0.03125, tickValue: 31.25 },
    "6E": { tickSize: 0.00005, tickValue: 6.25 },
    "6J": { tickSize: 0.0000005, tickValue: 6.25 },
  };

  // Calculate PnL automatically
  useEffect(() => {
    const calculatePnL = () => {
      const entryPrice = parseFloat(formData.entryPrice) || 0;
      const exitPrice = parseFloat(formData.exitPrice) || 0;
      const quantity = parseFloat(formData.quantity) || 0;
      const fees = parseFloat(formData.fees) || 0;
      const commissions = parseFloat(formData.commissions) || 0;

      let calculatedPnL = 0;
      if (formData.assetType === "option") {
        calculatedPnL = ((exitPrice - entryPrice) * quantity * 100) - fees - commissions;
      } else if (formData.assetType === "future") {
        const tickData = futuresTickValues[formData.symbol] || { tickSize: 0.25, tickValue: 12.50 };
        const ticks = (exitPrice - entryPrice) / tickData.tickSize;
        calculatedPnL = ticks * tickData.tickValue * quantity;
      } else if (formData.assetType === "stock") {
        calculatedPnL = ((exitPrice - entryPrice) * quantity) - fees - commissions;
      }

     setFormData((prev) => ({ 
  ...prev, 
  pnl: typeof calculatedPnL === "number" && !isNaN(calculatedPnL) 
    ? calculatedPnL.toFixed(2) 
    : "0.00" 
}));
    };

    calculatePnL();
  }, [formData.entryPrice, formData.exitPrice, formData.quantity, formData.fees, formData.commissions, formData.assetType, formData.symbol]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("optionDetails.") || name.startsWith("futureDetails.")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else if (name.startsWith("leg.")) {
      const [, index, field] = name.split(".");
      setFormData((prev) => {
        const newLegs = [...prev.optionDetails.legs];
        newLegs[index] = {
          ...newLegs[index],
          [field]: value,
        };
        return {
          ...prev,
          optionDetails: {
            ...prev.optionDetails,
            legs: newLegs,
          },
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addLeg = () => {
    setFormData((prev) => ({
      ...prev,
      optionDetails: {
        ...prev.optionDetails,
        legs: [...prev.optionDetails.legs, { type: "call", strikePrice: "", quantity: "" }],
      },
    }));
  };

  const removeLeg = (index) => {
    setFormData((prev) => {
      const newLegs = prev.optionDetails.legs.filter((_, i) => i !== index);
      return {
        ...prev,
        optionDetails: {
          ...prev.optionDetails,
          legs: newLegs,
        },
      };
    });
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, tradeRating: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const tradesRef = collection(db, "users", user.uid, "trades");
      const tradeData = {
        assetType: formData.assetType,
        symbol: formData.symbol,
        entryPrice: parseFloat(formData.entryPrice) || 0,
        exitPrice: parseFloat(formData.exitPrice) || 0,
        entryTime: formData.entryTime || new Date().toISOString(), // Default to now if empty
        exitTime: formData.exitTime || new Date().toISOString(),
        quantity: parseFloat(formData.quantity) || 0,
        direction: formData.direction,
        status: formData.status,
        fees: parseFloat(formData.fees) || 0,
        commissions: parseFloat(formData.commissions) || 0,
        pnl: parseFloat(formData.pnl) || 0,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        notes: formData.notes,
        playbook: formData.playbook,
        tradeRating: formData.tradeRating,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (formData.assetType === "option") {
        tradeData.optionDetails = {
          type: formData.optionDetails.type,
          strikePrice: parseFloat(formData.optionDetails.strikePrice) || 0,
          expirationDate: formData.optionDetails.expirationDate,
          legs: formData.optionDetails.legs.map((leg) => ({
            type: leg.type,
            strikePrice: parseFloat(leg.strikePrice) || 0,
            quantity: parseInt(leg.quantity) || 0,
          })),
          multiplier: 100, // Standard for options
        };
      } else if (formData.assetType === "future") {
        const tickData = futuresTickValues[formData.symbol] || { tickSize: 0.25, tickValue: 12.50 };
        tradeData.futureDetails = {
          contractType: formData.futureDetails.contractType,
          contractSize: parseInt(formData.futureDetails.contractSize) || 0,
          margin: parseFloat(formData.futureDetails.margin) || 0,
          multiplier: tickData.tickValue / tickData.tickSize, // Derived from tick values
        };
      }

      await addDoc(tradesRef, tradeData);
      triggerRefresh();
      navigate("/trades");
    } catch (err) {
      console.error("Error adding trade:", err);
      alert("Failed to add trade. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2 sm:mb-0">Add Trade</h1>
          <button
            onClick={() => navigate("/trades")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Trades
          </button>
        </div>
        <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asset Type</label>
              <select
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="stock">Stock</option>
                <option value="option">Option</option>
                <option value="future">Future</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
              <select
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Select Symbol</option>
                {symbols.map((symbol) => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entry Time</label>
              <input
                type="datetime-local"
                name="entryTime"
                value={formData.entryTime}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exit Time</label>
              <input
                type="datetime-local"
                name="exitTime"
                value={formData.exitTime}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entry Price</label>
                <input
                  type="number"
                  name="entryPrice"
                  value={formData.entryPrice}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exit Price</label>
                <input
                  type="number"
                  name="exitPrice"
                  value={formData.exitPrice}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Direction</label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fees</label>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Commissions</label>
                <input
                  type="number"
                  name="commissions"
                  value={formData.commissions}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">P&L (Auto-Calculated)</label>
              <input
                type="text"
                name="pnl"
                value={formData.pnl}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
                readOnly
              />
            </div>

            {formData.assetType === "option" && (
              <div className="space-y-4 border-t border-gray-200 dark:border-zinc-700 pt-4">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">Option Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Option Type</label>
                  <select
                    name="optionDetails.type"
                    value={formData.optionDetails.type}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="call">Call</option>
                    <option value="put">Put</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Strike Price</label>
                  <input
                    type="number"
                    name="optionDetails.strikePrice"
                    value={formData.optionDetails.strikePrice}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiration Date</label>
                  <input
                    type="date"
                    name="optionDetails.expirationDate"
                    value={formData.optionDetails.expirationDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Multi-Leg Options</h4>
                  {formData.optionDetails.legs.map((leg, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 mt-2">
                      <select
                        name={`leg.${index}.type`}
                        value={leg.type}
                        onChange={handleChange}
                        className="block w-full sm:w-1/3 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="call">Call</option>
                        <option value="put">Put</option>
                      </select>
                      <input
                        type="number"
                        name={`leg.${index}.strikePrice`}
                        value={leg.strikePrice}
                        onChange={handleChange}
                        placeholder="Strike Price"
                        className="block w-full sm:w-1/3 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                      />
                      <input
                        type="number"
                        name={`leg.${index}.quantity`}
                        value={leg.quantity}
                        onChange={handleChange}
                        placeholder="Quantity"
                        className="block w-full sm:w-1/3 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                      />
                      {formData.optionDetails.legs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLeg(index)}
                          className="text-red-500 hover:text-red-600 mt-2 sm:mt-0"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLeg}
                    className="mt-2 text-blue-500 hover:text-blue-600"
                  >
                    Add Leg
                  </button>
                </div>
              </div>
            )}

            {formData.assetType === "future" && (
              <div className="space-y-4 border-t border-gray-200 dark:border-zinc-700 pt-4">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">Future Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Type</label>
                  <input
                    type="text"
                    name="futureDetails.contractType"
                    value={formData.futureDetails.contractType}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., ES (E-mini S&P 500)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Size</label>
                  <input
                    type="number"
                    name="futureDetails.contractSize"
                    value={formData.futureDetails.contractSize}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Margin</label>
                  <input
                    type="number"
                    name="futureDetails.margin"
                    value={formData.futureDetails.margin}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma-separated or select predefined)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Scalp, Breakout"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {predefinedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const tags = formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [];
                      if (!tags.includes(tag)) {
                        setFormData((prev) => ({ ...prev, tags: [...tags, tag].join(", ") }));
                      }
                    }}
                    className="bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Playbook</label>
              <select
                name="playbook"
                value={formData.playbook}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Playbook</option>
                {playbooks.map((playbook) => (
                  <option key={playbook} value={playbook}>{playbook}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trade Rating</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`text-2xl ${formData.tradeRating >= star ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
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
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => navigate("/trades")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full sm:w-auto"
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

export default AddTrade;
