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
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
