import React, { useState } from "react";
import { useFilters } from "../context/FilterContext";
import { Check, Filter } from "lucide-react";

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
  const { setClickedTag } = useFilters();

  const toggleFilter = (category, filter) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(filter)
        ? current.filter((f) => f !== filter)
        : [...current, filter];
      return { ...prev, [category]: updated };
    });
  };

  const resetAll = () => {
    setSelectedFilters({});
  };

  const applyFilters = () => {
    const flatTags = Object.values(selectedFilters).flat();
    if (flatTags.length) setClickedTag(flatTags[0]);
    setOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2 border rounded shadow-sm hover:bg-gray-100 text-sm font-medium bg-white"
      >
        <Filter size={16} className="text-green-600" />
        <span className="text-gray-700">Filters</span>
      </button>

      {open && (
        <div className="absolute top-12 left-0 w-[350px] max-h-[80vh] overflow-y-auto bg-white shadow-xl rounded-lg border p-4 z-50">
          {Object.entries(filterCategories).map(([category, filters]) => (
            <div key={category} className="mb-4">
              <div className="font-semibold text-sm mb-2 text-gray-800">{category}</div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const isActive =
                    selectedFilters[category]?.includes(filter) || false;
                  return (
                    <button
                      key={filter}
                      onClick={() => toggleFilter(category, filter)}
                      className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {isActive && <Check size={12} />}
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center mt-4 border-t pt-3">
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
