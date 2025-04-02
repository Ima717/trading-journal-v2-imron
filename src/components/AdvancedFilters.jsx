import React, { useState, useEffect } from "react";
import { ChevronDown, Check, AlertTriangle } from "lucide-react";
import { useFilters } from "../context/FilterContext";

const filterCategories = {
  Result: ["All", "Win", "Loss", "Break-even"],
  General: ["Reviewed", "Unreviewed", "Open", "Closed"],
  Tags: ["Breakout", "Reversal", "News Play", "Overtraded", "Perfect"],
  Playbook: ["A+ Setup", "B Setup", "C Setup"],
};

const AdvancedFilters = () => {
  const [open, setOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [hasError, setHasError] = useState(false);
  const { setClickedTag } = useFilters();

  useEffect(() => {
    try {
      // Simulate filter loading
      setHasError(false);
    } catch (err) {
      setHasError(true);
    }
  }, []);

  const toggleFilter = (category, value) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const resetAll = () => {
    setSelectedFilters({});
  };

  const applyFilters = () => {
    setOpen(false);
    const flat = Object.values(selectedFilters).flat();
    if (flat.length > 0) {
      setClickedTag(flat[0]); // Demo use case
    }
  };

  return (
    <div className="relative z-40">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 text-sm font-medium"
      >
        <span className="text-purple-600">🎛</span>
        <span className="text-gray-700">Filters</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-[360px] bg-white shadow-2xl rounded-lg border p-4 animate-fade-slide-down z-50">
          {Object.entries(filterCategories).map(([category, options]) => (
            <div key={category} className="mb-4">
              <div className="text-sm font-semibold text-gray-800 mb-2">{category}</div>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const selected = selectedFilters[category]?.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleFilter(category, option)}
                      className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1 ${
                        selected
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {selected && <Check size={12} />}
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Error handling */}
          {hasError && (
            <div className="flex items-center gap-2 text-red-500 text-xs mt-2">
              <AlertTriangle size={14} /> Failed to load filters. Please try again.
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between items-center border-t pt-3 mt-4">
            <button
              onClick={resetAll}
              className="text-xs text-purple-600 hover:underline"
            >
              Reset all
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
