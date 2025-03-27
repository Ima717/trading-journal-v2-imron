// /src/components/SearchFilter.jsx (Updated)
import React from "react";

const SearchFilter = ({ searchTerm, onSearchChange, selectedTag, onClear }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search tags..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 focus:shadow-lg"
      />
      {selectedTag && (
        <button
          onClick={onClear}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default SearchFilter;
