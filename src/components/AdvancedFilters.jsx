import React, { useEffect, useState } from "react";
import { ChevronDown, Check, AlertTriangle } from "lucide-react";
import { useFilters } from "../context/FilterContext";
import clsx from "clsx";

const filterCategories = {
  Result: ["Win", "Loss", "Break-Even"],
  General: ["Reviewed", "Unreviewed", "Open", "Closed"],
  Tags: ["Breakout", "Reversal", "News Play", "Overtraded", "Perfect"],
  "Day & Time": ["Monday", "Tuesday", "Pre-market", "After-hours"],
  Playbook: ["A+ Setup", "B Setup", "C Setup"],
};

const AdvancedFilters = () => {
  const [open, setOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [error, setError] = useState(false);
  const { setClickedTag } = useFilters();

  const toggleFilter = (category, filter) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      const exists = current.includes(filter);
      const updated = exists
        ? current.filter((f) => f !== filter)
        : [...current, filter];
      return { ...prev, [category]: updated };
    });
  };

  const resetAll = () => {
    setSelectedFilters({});
  };

  const applyFilters = () => {
    setOpen(false);
    const flatTags = Object.values(selectedFilters).flat();
    if (flatTags.length) setClickedTag(flatTags[0]);
  };

  useEffect(() => {
    // Simulate loading filters (replace with real fetch if needed)
    try {
      // e.g., fetch filters here
      setError(false);
    } catch (err) {
      console.error("Failed to load filters", err);
      setError(true);
    }
  }, []);

  return (
    <div className="relative z-40">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 text-sm font-medium"
      >
        <span className="text-green-700">🧪</span>
        <span className="text-gray-700">Filters</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 top-12 w-[360px] bg-white shadow-xl rounded-lg border p-4 z-50 animate-dropdown"
          )}
        >
          {Object.entries(filterCategories).map(([category, filters]) => (
            <div key={category} className="mb-4">
              <div className="font-semibold text-sm mb-2 text-gray-800">{category}</div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const isActive = selectedFilters[category]?.includes(filter) || false;
                  return (
                    <button
                      key={filter}
                      onClick={() => toggleFilter(category, filter)}
                      className={clsx(
                        "px-3 py-1 text-xs rounded-full border flex items-center gap-1 transition-all",
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {isActive && <Check size={12} />}
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {error && (
            <div className="text-red-500 text-sm flex items-center gap-2 mt-3">
              <AlertTriangle size={16} />
              Failed to load filters. Please try again.
            </div>
          )}

          <div className="flex justify-between mt-4 border-t pt-3">
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
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
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
