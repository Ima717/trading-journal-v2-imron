// /src/context/FilterContext.jsx
import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

  const resetFilters = () => {
    setDateRange({ start: null, end: null });
    setSelectedTag(null);
    setSearchTerm("");
    setResultFilter("all");
  };

  const filterTrades = (trades) => {
    let filtered = [...trades];

    // Filter by date
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((trade) => {
        const tradeDate = new Date(trade.date);
        return (
          tradeDate >= new Date(dateRange.start) &&
          tradeDate <= new Date(dateRange.end)
        );
      });
    }

    // Filter by PnL-based result
    if (resultFilter !== "all") {
      filtered = filtered.filter((trade) => {
        const pnl = Number(trade.pnl);
        if (resultFilter === "win") return pnl > 0;
        if (resultFilter === "loss") return pnl < 0;
        if (resultFilter === "breakeven") return pnl === 0;
        return true;
      });
    }

    // Filter by search tag
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((trade) =>
        trade.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by clicked tag
    if (selectedTag) {
      filtered = filtered.filter((trade) =>
        trade.tags?.includes(selectedTag)
      );
    }

    return filtered;
  };

  return (
    <FilterContext.Provider
      value={{
        dateRange,
        setDateRange,
        selectedTag,
        setSelectedTag,
        searchTerm,
        setSearchTerm,
        resultFilter,
        setResultFilter,
        resetFilters,
        filterTrades,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
