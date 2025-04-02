import React, { useState, useEffect, useRef } from "react";
import { useFilters } from "../context/FilterContext";

const SearchFilter = ({ searchTerm, onSearchChange, selectedTag, onClear }) => {
  const { tagSearchTerm } = useFilters();
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const allTags = ["Scalp", "Swing", "Day Trade", "Long Term", "Momentum", "Breakout"];

  useEffect(() => {
    if (tagSearchTerm) {
      const filteredSuggestions = allTags.filter((tag) =>
        tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setIsDropdownOpen(true);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [tagSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (tag) => {
    onSearchChange(tag);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <input
        type="text"
        placeholder="Search tags..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => tagSearchTerm && setIsDropdownOpen(true)}
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
      {isDropdownOpen && suggestions.length > 0 && (
        <div className="absolute top-12 left-0 w-64 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {suggestions.map((tag, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(tag)}
              className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
