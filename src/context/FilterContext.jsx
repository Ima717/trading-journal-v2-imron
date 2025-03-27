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
    let filtered = trades;

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((trade) => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= new Date(dateRange.start) && tradeDate <= new Date(dateRange.end);
      });
    }

    if (resultFilter === "win") {
      filtered = filtered.filter((trade) => trade.pnl > 0);
    } else if (resultFilter === "loss") {
      filtered = filtered.filter((trade) => trade.pnl < 0);
    } else if (resultFilter === "breakeven") {
      filtered = filtered.filter((trade) => trade.pnl === 0);
    }

    if (selectedTag) {
      filtered = filtered.filter((trade) =>
        trade.tags?.includes(selectedTag)
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((trade) =>
        trade.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
        filterTrades
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
