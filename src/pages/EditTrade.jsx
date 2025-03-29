// /src/pages/EditTrade.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import { createChart } from "lightweight-charts";
import axios from "axios";

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
    quantity: "",
    entryPrice: "",
    exitPrice: "",
    fees: "",
    commissions: "",
    pnl: 0,
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
  const [mae, setMae] = useState(0);
  const [mfe, setMfe] = useState(0);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

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
      if (!user || !id) return;

      try {
        const tradeRef = doc(db, "users", user.uid, "trades", id);
        const tradeSnap = await getDoc(tradeRef);

        if (tradeSnap.exists()) {
          const tradeData = tradeSnap.data();
          setFormData({
            symbol: tradeData.symbol || "",
            instrumentType: tradeData.instrumentType || "option",
            date: tradeData.date || "",
            quantity: tradeData.quantity || "",
            entryPrice: tradeData.entryPrice || "",
            exitPrice: tradeData.exitPrice || "",
            fees: tradeData.fees || "",
            commissions: tradeData.commissions || "",
            pnl: tradeData.pnl || 0,
            tags: tradeData.tags ? tradeData.tags.join(", ") : "",
            notes: tradeData.notes || "",
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
          setError("Trade not found.");
        }
      } catch (err) {
        console.error("Error fetching trade:", err);
        setError("Failed to load trade. Please try again.");
      }
    };

    fetchTrade();
  }, [user, id]);

  // Fetch historical data for the chart
  useEffect(() => {
    const fetchChartData = async () => {
      if (!formData.symbol || !formData.date) return;

      try {
        const apiKey = "YOUR_ALPHA_VANTAGE_API_KEY"; // Replace with your Alpha Vantage API key
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${formData.symbol}&interval=1min&month=${formData.date.slice(0, 7)}&outputsize=full&apikey=${apiKey}`
        );

        const timeSeries = response.data["Time Series (1min)"];
        if (!timeSeries) {
          console.error("No time series data found for this symbol and date.");
          return;
        }

        const chartData = Object.entries(timeSeries).map(([time, values]) => ({
          time: new Date(time).getTime() / 1000,
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
        }));

        // Filter data to the trade date
        const tradeDateStart = new Date(formData.date).setHours(0, 0, 0, 0) / 1000;
        const tradeDateEnd = new Date(formData.date).setHours(23, 59, 59, 999) / 1000;
        const filteredData = chartData.filter(
          (data) => data.time >= tradeDateStart && data.time <= tradeDateEnd
        );

        setChartData(filteredData);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setChartData([]);
      }
    };

    fetchChartData();
  }, [formData.symbol, formData.date]);

  // Calculate PnL, MAE, and MFE automatically
  useEffect(() => {
    const calculateMetrics = () => {
      const entryPrice = parseFloat(formData.entryPrice) || 0;
      const exitPrice = parseFloat(formData.exitPrice) || 0;
      const quantity = parseFloat(formData.quantity) || 0;
      const fees = parseFloat(formData.fees) || 0;
      const commissions = parseFloat(formData.commissions) || 0;

      // Calculate PnL
      let calculatedPnL = 0;
      if (formData.instrumentType === "option") {
        calculatedPnL = ((exitPrice - entryPrice) * quantity * 100) - fees - commissions;
      } else if (formData.instrumentType === "future") {
        const tickData = futuresTickValues[formData.symbol] || { tickSize: 0.25, tickValue: 12.50 };
        const ticks = (exitPrice - entryPrice) / tickData.tickSize;
        calculatedPnL = ticks * tickData.tickValue * quantity;
      }

      // Calculate MAE/MFE (simplified: assuming linear price movement between entry and exit)
      const priceDiff = exitPrice - entryPrice;
      const maeValue = priceDiff < 0 ? Math.abs(priceDiff) : 0; // MAE is the max loss
      const mfeValue = priceDiff > 0 ? priceDiff : 0; // MFE is the max gain

      setFormData((prev) => ({ ...prev, pnl: calculatedPnL.toFixed(2) }));
      setMae(maeValue.toFixed(2));
      setMfe(mfeValue.toFixed(2));
    };

    calculateMetrics();
  }, [formData.entryPrice, formData.exitPrice, formData.quantity, formData.fees, formData.commissions, formData.instrumentType, formData.symbol]);

  // Setup TradingView chart
  useEffect(() => {
    if (!chartContainerRef.current || !formData.symbol || !formData.date || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "#1a1a1a" }, // Dark background like TradeZella
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#2a2a2a" },
        horzLines: { color: "#2a2a2a" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a", // Green for up candles
      downColor: "#ef5350", // Red for down candles
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candlestickSeries.setData(chartData);

    // Add entry and exit markers (simplified: using the trade date as the time)
    candlestickSeries.setMarkers([
      {
        time: new Date(formData.date).getTime() / 1000,
        position: "belowBar",
        color: "green",
        shape: "arrowUp",
        text: "Entry",
      },
      {
        time: new Date(formData.date).getTime() / 1000 + 3600, // Offset by 1 hour for visibility
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
  }, [formData.symbol, formData.date, formData.entryPrice, formData.exitPrice, chartData]);

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
    if (!user || !id) return;

    try {
      const tradeRef = doc(db, "users", user.uid, "trades", id);
      const tradeData = {
        symbol: formData.symbol,
        instrumentType: formData.instrumentType,
        date: formData.date,
        quantity: parseFloat(formData.quantity) || 0,
        entryPrice: parseFloat(formData.entryPrice) || 0,
        exitPrice: parseFloat(formData.exitPrice) || 0,
        fees: parseFloat(formData.fees) || 0,
        commissions: parseFloat(formData.commissions) || 0,
        pnl: parseFloat(formData.pnl) || 0,
        result: parseFloat(formData.pnl) >= 0 ? "win" : "loss",
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        notes: formData.notes,
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
      setError("Failed to update trade. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!user || !id) return;
    if (!window.confirm("Are you sure you want to delete this trade?")) return;

    try {
      const tradeRef = doc(db, "users", user.uid, "trades", id);
      await deleteDoc(tradeRef);
      triggerRefresh();
      navigate("/trades");
    } catch (err) {
      console.error("Error deleting trade:", err);
      setError("Failed to delete trade. Please try again.");
    }
  };

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
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:mb-0">
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">Edit Trade</h1>
          </div>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instrument Type</label>
              <select
                name="instrumentType"
                value={formData.instrumentType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="option">Option</option>
                <option value="future">Future</option>
              </select>
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">MAE (Auto-Calculated)</label>
                <input
                  type="text"
                  value={mae}
                  className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
                  readOnly
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">MFE (Auto-Calculated)</label>
                <input
                  type="text"
                  value={mfe}
                  className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
                  readOnly
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trade Chart</label>
              <div ref={chartContainerRef} className="mt-1 border border-gray-300 dark:border-zinc-700 rounded-md"></div>
            </div>

            {formData.instrumentType === "option" && (
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

            {formData.instrumentType === "future" && (
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
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Delete
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

export default EditTrade;
