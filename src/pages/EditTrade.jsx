import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { createChart } from "lightweight-charts";
import { safeToFixed } from '../utils/safeToFixed';
import ReactQuill from "react-quill";

const EditTrade = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useFilters();
  const { id } = useParams();
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const [formData, setFormData] = useState({
    symbol: "",
    instrumentType: "option",
    date: "",
    side: "long",
    optionsTraded: "",
    quantity: "",
    entryPrice: "",
    exitPrice: "",
    fees: "",
    commissions: "",
    netRoi: 0,
    grossPnl: 0,
    adjustedCost: 0,
    zellaScale: { mae: 0, mfe: 0 },
    profitTarget: "",
    stopLoss: "",
    initialTarget: "",
    tradeRisk: "",
    plannedRMultiple: "",
    realizedRMultiple: "",
    averageEntry: "",
    averageExit: "",
    entryTime: "",
    exitTime: "",
    pnl: 0,
    tags: "",
    tradeNote: "",
    dailyJournal: "",
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
  const [mae, setMae] = useState(0);
  const [mfe, setMfe] = useState(0);
  const [activeTab, setActiveTab] = useState("tradeNote");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Fetch trade data on mount
  useEffect(() => {
    const fetchTrade = async () => {
      if (!user || !id) {
        setError("User or trade ID not found. Please sign in or check the trade ID.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching trade with ID:", id, "for user:", user.uid);
        const tradeRef = doc(db, "users", user.uid, "trades", id);
        const tradeSnap = await getDoc(tradeRef);

        if (tradeSnap.exists()) {
          const tradeData = tradeSnap.data();
          console.log("Trade data fetched:", tradeData);
          setFormData({
            symbol: tradeData.symbol || "",
            instrumentType: tradeData.instrumentType || "option",
            date: tradeData.date || "",
            side: tradeData.side || "long",
            optionsTraded: tradeData.optionsTraded || "",
            quantity: tradeData.quantity || "",
            entryPrice: tradeData.entryPrice || "",
            exitPrice: tradeData.exitPrice || "",
            fees: tradeData.fees || "",
            commissions: tradeData.commissions || "",
            netRoi: tradeData.netRoi || 0,
            grossPnl: tradeData.grossPnl || 0,
            adjustedCost: tradeData.adjustedCost || 0,
            zellaScale: tradeData.zellaScale || { mae: 0, mfe: 0 },
            profitTarget: tradeData.profitTarget || "",
            stopLoss: tradeData.stopLoss || "",
            initialTarget: tradeData.initialTarget || "",
            tradeRisk: tradeData.tradeRisk || "",
            plannedRMultiple: tradeData.plannedRMultiple || "",
            realizedRMultiple: tradeData.realizedRMultiple || "",
            averageEntry: tradeData.averageEntry || "",
            averageExit: tradeData.averageExit || "",
            entryTime: tradeData.entryTime || "",
            exitTime: tradeData.exitTime || "",
            pnl: tradeData.pnl || 0,
            tags: tradeData.tags ? tradeData.tags.join(", ") : "",
            tradeNote: tradeData.tradeNote || tradeData.notes || "",
            dailyJournal: tradeData.dailyJournal || "",
            playbook: tradeData.playbook || "",
            tradeRating: tradeData.tradeRating || 0,
            optionDetails: tradeData.optionDetails || {
              type: "call",
              strikePrice: "",
              expirationDate: "",
              legs: [{ type: "call", strikePrice: "", quantity: "" }],
            },
            futureDetails: tradeData.futureDetails || {
              contractType: "",
              contractSize: "",
              margin: "",
            },
          });
        } else {
          setError("Trade not found. It may have been deleted or the ID is incorrect.");
        }
      } catch (err) {
        console.error("Error fetching trade:", err);
        setError(`Failed to load trade: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTrade();
  }, [user, id]);

  // Destructure formData for calculations
  const {
    entryPrice,
    exitPrice,
    quantity,
    fees,
    commissions,
    instrumentType,
    symbol,
  } = formData;

  // Calculate PnL, MAE, MFE, Net ROI, Gross P&L, Adjusted Cost, Zella Scale
  useEffect(() => {
    const calculateMetrics = () => {
      const parsedEntry = parseFloat(entryPrice) || 0;
      const parsedExit = parseFloat(exitPrice) || 0;
      const parsedQty = parseFloat(quantity) || 0;
      const parsedFees = parseFloat(fees) || 0;
      const parsedCommissions = parseFloat(commissions) || 0;

      // Calculate Gross P&L
      let grossPnl = 0;
      if (instrumentType === "option") {
        grossPnl = (parsedExit - parsedEntry) * parsedQty * 100;
      } else if (instrumentType === "future") {
        const tickData = futuresTickValues[symbol] || { tickSize: 0.25, tickValue: 12.50 };
        const ticks = (parsedExit - parsedEntry) / tickData.tickSize;
        grossPnl = ticks * tickData.tickValue * parsedQty;
      }

      // Calculate Net P&L
      const netPnl = grossPnl - parsedFees - parsedCommissions;

      // Calculate Adjusted Cost
      const adjustedCost = parsedEntry * parsedQty * (instrumentType === "option" ? 100 : 1);

      // Calculate Net ROI
      const netRoi = adjustedCost !== 0 ? (netPnl / adjustedCost) * 100 : 0;

      // Calculate MAE/MFE (simplified: assuming linear price movement between entry and exit)
      const priceDiff = parsedExit - parsedEntry;
      const maeValue = priceDiff < 0 ? Math.abs(priceDiff) : 0; // MAE is the max loss
      const mfeValue = priceDiff > 0 ? priceDiff : 0; // MFE is the max gain

      // Calculate Zella Scale (simplified: using MAE/MFE as a ratio)
      const zellaScale = {
        mae: maeValue,
        mfe: mfeValue,
      };

      const safeToFixed = (val, digits = 2) =>
        !isNaN(val) ? Number(val).toFixed(digits) : "0.00";

      setFormData((prev) => ({
        ...prev,
        netRoi: safeToFixed(netRoi),
        grossPnl: safeToFixed(grossPnl),
        adjustedCost: safeToFixed(adjustedCost),
        zellaScale,
        pnl: safeToFixed(netPnl),
      }));

      setMae(safeToFixed(maeValue));
      setMfe(safeToFixed(mfeValue));
    };

    calculateMetrics();
  }, [entryPrice, exitPrice, quantity, fees, commissions, instrumentType, symbol]);

  // Setup TradingView chart
  useEffect(() => {
    if (!chartContainerRef.current || !formData.symbol || !formData.date) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries();

    // Mock candlestick data (replace with real data in production)
    const mockData = [
      { time: new Date(formData.date).getTime() / 1000 - 3600, open: parseFloat(formData.entryPrice) * 0.98, high: parseFloat(formData.entryPrice) * 1.02, low: parseFloat(formData.entryPrice) * 0.95, close: parseFloat(formData.entryPrice) },
      { time: new Date(formData.date).getTime() / 1000, open: parseFloat(formData.entryPrice), high: Math.max(parseFloat(formData.entryPrice), parseFloat(formData.exitPrice)) * 1.01, low: Math.min(parseFloat(formData.entryPrice), parseFloat(formData.exitPrice)) * 0.99, close: parseFloat(formData.exitPrice) },
      { time: new Date(formData.date).getTime() / 1000 + 3600, open: parseFloat(formData.exitPrice), high: parseFloat(formData.exitPrice) * 1.02, low: parseFloat(formData.exitPrice) * 0.98, close: parseFloat(formData.exitPrice) * 1.01 },
    ];

    candlestickSeries.setData(mockData);

    // Add entry and exit markers
    candlestickSeries.setMarkers([
      {
        time: new Date(formData.date).getTime() / 1000,
        position: "belowBar",
        color: "green",
        shape: "arrowUp",
        text: "Entry",
      },
      {
        time: new Date(formData.date).getTime() / 1000,
        position: "aboveBar",
        color: "red",
        shape: "arrowDown",
        text: "Exit",
      },
    ]);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [formData.symbol, formData.date, formData.entryPrice, formData.exitPrice]);

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

  const handleNotesChange = (value, field) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    if (!user || !id) {
      setError("User or trade ID not found. Please sign in or check the trade ID.");
      return;
    }

    try {
      const tradeRef = doc(db, "users", user.uid, "trades", id);
      const tradeData = {
        symbol: formData.symbol,
        instrumentType: formData.instrumentType,
        date: formData.date,
        side: formData.side,
        optionsTraded: parseInt(formData.optionsTraded) || 0,
        quantity: parseFloat(formData.quantity) || 0,
        entryPrice: parseFloat(formData.entryPrice) || 0,
        exitPrice: parseFloat(formData.exitPrice) || 0,
        fees: parseFloat(formData.fees) || 0,
        commissions: parseFloat(formData.commissions) || 0,
        netRoi: parseFloat(formData.netRoi) || 0,
        grossPnl: parseFloat(formData.grossPnl) || 0,
        adjustedCost: parseFloat(formData.adjustedCost) || 0,
        zellaScale: formData.zellaScale,
        profitTarget: parseFloat(formData.profitTarget) || 0,
        stopLoss: parseFloat(formData.stopLoss) || 0,
        initialTarget: parseFloat(formData.initialTarget) || 0,
        tradeRisk: parseFloat(formData.tradeRisk) || 0,
        plannedRMultiple: parseFloat(formData.plannedRMultiple) || 0,
        realizedRMultiple: parseFloat(formData.realizedRMultiple) || 0,
        averageEntry: parseFloat(formData.averageEntry) || 0,
        averageExit: parseFloat(formData.averageExit) || 0,
        entryTime: formData.entryTime,
        exitTime: formData.exitTime,
        pnl: parseFloat(formData.pnl) || 0,
        result: parseFloat(formData.pnl) >= 0 ? "win" : "loss",
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        tradeNote: formData.tradeNote,
        dailyJournal: formData.dailyJournal,
        playbook: formData.playbook,
        tradeRating: formData.tradeRating,
      };

      if (formData.instrumentType === "option") {
        tradeData.optionDetails = {
          type: formData.optionDetails.type,
          strikePrice: parseFloat(formData.optionDetails.strikePrice) || 0,
          expirationDate: formData.optionDetails.expirationDate,
          legs: formData.optionDetails.legs.map((leg) => ({
            type: leg.type,
            strikePrice: parseFloat(leg.strikePrice) || 0,
            quantity: parseInt(leg.quantity) || 0,
          })),
        };
      } else if (formData.instrumentType === "future") {
        tradeData.futureDetails = {
          contractType: formData.futureDetails.contractType,
          contractSize: parseInt(formData.futureDetails.contractSize) || 0,
          margin: parseFloat(formData.futureDetails.margin) || 0,
        };
      }

      await updateDoc(tradeRef, tradeData);
      triggerRefresh();
      navigate("/trades");
    } catch (err) {
      console.error("Error updating trade:", err);
      setError(`Failed to update trade: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!user || !id) {
      setError("User or trade ID not found. Please sign in or check the trade ID.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this trade?")) return;

    try {
      const tradeRef = doc(db, "users", user.uid, "trades", id);
      await deleteDoc(tradeRef);
      triggerRefresh();
      navigate("/trades");
    } catch (err) {
      console.error("Error deleting trade:", err);
      setError(`Failed to delete trade: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500 dark:text-gray-400">Loading trade data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={() => navigate("/trades")}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Trades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2 sm:mb-0">{formData.symbol} {formData.date}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/trades")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Trades
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Trade Stats */}
          <div className="lg:w-1/2">
            <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Net P&L</label>
                    <input
                      type="text"
                      value={formData.pnl}
                      className={`mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 ${formData.pnl >= 0 ? "text-green-600" : "text-red-500"}`}
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Side</label>
                    <select
                      name="side"
                      value={formData.side}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                  {formData.instrumentType === "option" && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options Traded</label>
                      <input
                        type="number"
                        name="optionsTraded"
                        value={formData.optionsTraded}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Commissions & Fees</label>
                    <input
                      type="text"
                      value={(parseFloat(formData.fees) + parseFloat(formData.commissions)).toFixed(2)}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Net ROI</label>
                    <input
                      type="text"
                      value={`${formData.netRoi}%`}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gross P&L</label>
                    <input
                      type="text"
                      value={formData.grossPnl}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adjusted Cost</label>
                    <input
                      type="text"
                      value={formData.adjustedCost}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
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
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zella Scale (MAE / MFE)</label>
                    <input
                      type="text"
                      value={`${formData.zellaScale.mae} / ${formData.zellaScale.mfe}`}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
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
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profit Target</label>
                    <input
                      type="number"
                      name="profitTarget"
                      value={formData.profitTarget}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stop Loss</label>
                    <input
                      type="number"
                      name="stopLoss"
                      value={formData.stopLoss}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Target</label>
                    <input
                      type="number"
                      name="initialTarget"
                      value={formData.initialTarget}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trade Risk</label>
                    <input
                      type="number"
                      name="tradeRisk"
                      value={formData.tradeRisk}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Planned R-Multiple</label>
                    <input
                      type="number"
                      name="plannedRMultiple"
                      value={formData.plannedRMultiple}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Realized R-Multiple</label>
                    <input
                      type="number"
                      name="realizedRMultiple"
                      value={formData.realizedRMultiple}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Average Entry</label>
                    <input
                      type="number"
                      name="averageEntry"
                      value={formData.averageEntry}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Average Exit</label>
                    <input
                      type="number"
                      name="averageExit"
                      value={formData.averageExit}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entry Time</label>
                    <input
                      type="time"
                      name="entryTime"
                      value={formData.entryTime}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exit Time</label>
                    <input
                      type="time"
                      name="exitTime"
                      value={formData.exitTime}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
          {/* Right Column: Chart and Notes */}
          <div className="lg:w-1/2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4">Trade Chart</h3>
              <div ref={chartContainerRef} className="border border-gray-300 dark:border-zinc-700 rounded-md"></div>
            </div>
            <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 sm:p-6">
              <div className="flex border-b border-gray-200 dark:border-zinc-700 mb-4">
                <button
                  onClick={() => setActiveTab("tradeNote")}
                  className={`px-4 py-2 font-medium ${activeTab === "tradeNote" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                >
                  Trade Note
                </button>
                <button
                  onClick={() => setActiveTab("dailyJournal")}
                  className={`px-4 py-2 font-medium ${activeTab === "dailyJournal" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                >
                  Daily Journal
                </button>
              </div>
              {activeTab === "tradeNote" ? (
                <ReactQuill
                  value={formData.tradeNote}
                  onChange={(value) => handleNotesChange(value, "tradeNote")}
                  className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <ReactQuill
                  value={formData.dailyJournal}
                  onChange={(value) => handleNotesChange(value, "dailyJournal")}
                  className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
            <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4">Tags</h3>
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
            {formData.instrumentType === "option" && (
              <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4">Option Details</h3>
                <div className="space-y-4">
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
              </div>
            )}
            {formData.instrumentType === "future" && (
              <div className="bg-white dark:bg-zinc-900 shadow rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4">Future Details</h3>
                <div className="space-y-4">
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
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Save
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Delete
              </button>
              <button
                onClick={() => navigate("/trades")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTrade;
