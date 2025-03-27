// /src/context/FilterContext.jsx (Updated)
import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "./AuthContext";
import { filterTradesByDate } from "../utils/filterUtils";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [resultFilter, setResultFilter] = useState("all");
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [clickedTag, setClickedTag] = useState(null);
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const fetched = snapshot.docs.map((doc) => doc.data());
      setTrades(fetched);
    };

    fetchTrades();
  }, [user]);

  useEffect(() => {
    let result = filterTradesByDate(trades, dateRange);

    if (clickedTag) {
      result = result.filter((t) => t.tags?.includes(clickedTag));
    }

    if (resultFilter !== "all") {
      result = result.filter((t) => (resultFilter === "Win" ? t.pnl > 0 : t.pnl <= 0));
    }

    setFilteredTrades(result);
  }, [trades, dateRange, clickedTag, resultFilter]);

  const filterTrades = (tradesToFilter) => {
    let result = filterTradesByDate(tradesToFilter, dateRange);

    if (clickedTag) {
      result = result.filter((t) => t.tags?.includes(clickedTag));
    }

    if (resultFilter !== "all") {
      result = result.filter((t) => (resultFilter === "Win" ? t.pnl > 0 : t.pnl <= 0));
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
        filterTrades,
        filteredTrades, // Expose filteredTrades for use in components
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
