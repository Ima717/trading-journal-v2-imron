// /src/components/SearchFilter.jsx
import React from "react";

const SearchFilter = ({ searchTerm, onSearchChange, selectedTag, onClear }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 px-4 py-3 rounded shadow space-y-2 sm:space-y-0 sm:space-x-4">
      <div className="flex items-center w-full sm:w-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tags..."
          className="w-full sm:w-64 px-3 py-2 border rounded text-sm"
        />
      </div>

      {(selectedTag || searchTerm) && (
        <div className="text-sm text-gray-700 flex items-center space-x-2">
          {selectedTag && (
            <span>
              Filtered by tag:{" "}
              <span className="text-purple-600 font-medium">{selectedTag}</span>
            </span>
          )}
          <button
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-black underline"
          >
            Clear Filter ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
