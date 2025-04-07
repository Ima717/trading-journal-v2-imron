import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "./AuthContext";
import dayjs from "dayjs";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [resultFilter, setResultFilter] = useState("all");
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [clickedTag, setClickedTag] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [refresh, setRefresh] = useState(0);

  const triggerRefresh = () => setRefresh((prev) => prev + 1);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        const amount = parseFloat(data.amount) || 0;
        const commission = parseFloat(data.commission) || 0;
        const fees = parseFloat(data.fees) || 0;
        return {
          id: doc.id,
          ...data,
          entryTime: data.entryTime || data.date || new Date().toISOString(),
          date: data.entryTime || data.date,
          amount,
          commission,
          fees,
        };
      });

      // Pair buy/sell trades to compute P&L
      const tradePairs = {};
      const processedTrades = [];

      fetched.sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime)).forEach((trade) => {
        const key = `${trade.symbol}-${trade.quantity}`;
        if (!tradePairs[key]) tradePairs[key] = [];

        tradePairs[key].push(trade);

        if (tradePairs[key].length === 2) {
          const [buyTrade, sellTrade] = tradePairs[key].sort((a, b) =>
            a.side === "Buy" ? -1 : 1
          );
          if (buyTrade && sellTrade && buyTrade.side === "Buy" && sellTrade.side === "Sell") {
            const buyCost = buyTrade.quantity * buyTrade.price;
            const sellRevenue = sellTrade.quantity * sellTrade.price;
            const commission = (buyTrade.commission || 0) + (sellTrade.commission || 0);
            const fees = (buyTrade.fees || 0) + (sellTrade.fees || 0);
            const pnl = sellRevenue - buyCost - commission - fees;
            processedTrades.push({ ...buyTrade, pnl });
            processedTrades.push({ ...sellTrade, pnl });
          }
          delete tradePairs[key];
        }
      });

      Object.values(tradePairs).flat().forEach((trade) => {
        processedTrades.push({ ...trade, pnl: 0 });
      });

      setTrades(processedTrades);
    };

    fetchTrades();
  }, [user, refresh]);

  useEffect(() => {
    let result = [...trades];

    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      result = result.filter((trade) => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= start && tradeDate <= end;
      });
    }

    if (clickedTag) {
      result = result.filter((t) => t.tags?.includes(clickedTag));
    }

    if (resultFilter !== "all") {
      result = result.filter((t) => {
        if (resultFilter === "Win") return t.pnl > 0;
        if (resultFilter === "Loss") return t.pnl < 0;
        return t.pnl === 0;
      });
    }

    if (Object.keys(selectedFilters).length) {
      Object.entries(selectedFilters).forEach(([category, filters]) => {
        filters.forEach((filter) => {
          result = result.filter((trade) =>
            trade?.[category.toLowerCase()]?.includes(filter)
          );
        });
      });
    }

    setFilteredTrades(result);
  }, [trades, dateRange, clickedTag, resultFilter, selectedFilters]);

  const filterTrades = (tradesToFilter) => {
    let result = [...tradesToFilter];

    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      result = result.filter((trade) => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= start && tradeDate <= end;
      });
    }

    if (clickedTag) {
      result = result.filter((t) => t.tags?.includes(clickedTag));
    }

    if (resultFilter !== "all") {
      result = result.filter((t) => {
        if (resultFilter === "Win") return t.pnl > 0;
        if (resultFilter === "Loss") return t.pnl < 0;
        return t.pnl === 0;
      });
    }

    if (Object.keys(selectedFilters).length) {
      Object.entries(selectedFilters).forEach(([category, filters]) => {
        filters.forEach((filter) => {
          result = result.filter((trade) =>
            trade?.[category.toLowerCase()]?.includes(filter)
          );
        });
      });
    }

    return result;
  };

  return (
    <FilterContext.Provider
      value={{
        dateRange,
        setDateRange,
        resultFilter,
        setResultFilter,
        tagSearchTerm,
        setTagSearchTerm,
        clickedTag,
        setClickedTag,
        selectedFilters,
        setSelectedFilters,
        filteredTrades,
        filterTrades,
        triggerRefresh,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
