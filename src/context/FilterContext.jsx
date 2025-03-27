import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("all"); // "all", "win", "loss", "breakeven"

  const resetFilters = () => {
    setDateRange({ start: null, end: null });
    setSelectedTag(null);
    setSearchTerm("");
    setResultFilter("all");
  };

  const filterTradesByResult = (trades) => {
    if (resultFilter === "win") {
      return trades.filter((trade) => trade.pnl > 0);
    } else if (resultFilter === "loss") {
      return trades.filter((trade) => trade.pnl < 0);
    }
    return trades; // For "all" result
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
        filterTradesByResult, // Pass function to filter by result
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
