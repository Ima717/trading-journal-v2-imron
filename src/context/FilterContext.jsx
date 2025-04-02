import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "./AuthContext";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedFilters, setSelectedFilters] = useState({}); // NEW structure
  const [clickedTag, setClickedTag] = useState(null);
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [refresh, setRefresh] = useState(0);

  const triggerRefresh = () => setRefresh((prev) => prev + 1);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrades(fetched);
    };

    fetchTrades();
  }, [user, refresh]);

  useEffect(() => {
    setFilteredTrades(applyAllFilters(trades));
  }, [trades, dateRange, selectedFilters, clickedTag]);

  const applyAllFilters = (data) => {
    let result = [...data];

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      result = result.filter((trade) => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= start && tradeDate <= end;
      });
    }

    // Filter by clicked tag (optional)
    if (clickedTag) {
      result = result.filter((t) => t.tags?.includes(clickedTag));
    }

    // Filter by selectedFilters
    for (const [category, values] of Object.entries(selectedFilters)) {
      if (values.length === 0) continue;
      result = result.filter((trade) => {
        return values.some((val) => {
          const field = trade[category.toLowerCase().replace(" ", "")]; // normalize field name
          return field === val || (Array.isArray(field) && field.includes(val));
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
        selectedFilters,
        setSelectedFilters,
        clickedTag,
        setClickedTag,
        filteredTrades,
        applyAllFilters,
        triggerRefresh,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
