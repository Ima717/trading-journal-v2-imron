import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const resetFilters = () => {
    setDateRange({ start: null, end: null });
    setSelectedTag(null);
    setSearchTerm("");
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
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
