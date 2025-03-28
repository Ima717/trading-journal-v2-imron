// /src/context/FilterContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "./AuthContext";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [resultFilter, setResultFilter] = useState("all");
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [clickedTag, setClickedTag] = useState(null);
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [refresh, setRefresh] = useState(0);

  const triggerRefresh = () => {
    setRefresh((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id, // Include the document ID
        ...doc.data(),
      }));
      setTrades(fetched);
    };

    fetchTrades();
  }, [user, refresh]);

  useEffect(() => {
    let result = trades;

    if (dateRange.start && dateRange.end) {
      result = result.filter((trade) => {
        const tradeDate = new Date(trade.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return tradeDate >= startDate && tradeDate <= endDate;
      });
    }

    if (clickedTag) {
      result = result.filter((t) => t.tags?.includes(clickedTag));
    }

    if (resultFilter !== "all") {
      result = result.filter((t) =>
        resultFilter === "Win" ? t.pnl > 0 : resultFilter === "Loss" ? t.pnl < 0 : t.pnl === 0
      );
    }

    setFilteredTrades(result);
  }, [trades, dateRange, clickedTag, resultFilter]);

  const filterTrades = (tradesToFilter) => {
    let result = tradesToFilter;

    if (dateRange.start && dateRange.end) {
      result = result.filter((trade) => {
        const tradeDate = new Date(trade.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return tradeDate >= startDate && tradeDate <= endDate;
      });
    }

    if (clickedTag) {
      result = result.filter((t) => t.tags?.includes(clickedTag));
    }

    if (resultFilter !== "all") {
      result = result.filter((t) =>
        resultFilter === "Win" ? t.pnl > 0 : resultFilter === "Loss" ? t.pnl < 0 : t.pnl === 0
      );
    }

    return result;
  };

  return (
    <FilterContext.Provider
      value={{
        dateRange: dateRange || { start: null, end: null },
        setDateRange,
        resultFilter: resultFilter || "all",
        setResultFilter,
        tagSearchTerm: tagSearchTerm || "",
        setTagSearchTerm,
        clickedTag: clickedTag || null,
        setClickedTag,
        filterTrades,
        filteredTrades: filteredTrades || [],
        triggerRefresh,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
