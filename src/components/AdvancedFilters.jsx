import React, { useState } from "react";
import { ChevronDown, Filter, X, Check } from "lucide-react";
import { useFilters } from "../context/FilterContext";

const filterOptions = {
  General: [
    "Instrument",
    "Intraday/Multiday",
    "Open/Closed",
    "Reviewed/Unreviewed",
    "Side",
    "Symbol",
    "Status",
    "Trade rating",
  ],
  Tags: ["Mistakes", "Successes"],
};

const AdvancedFilters = () => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("General");
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

  const applyFilters = () => {
    const flatTags = Object.values(selectedFilters).flat();
    if (flatTags.length > 0) setClickedTag(flatTags[0]); // optional context usage
    setOpen(false);
  };

  const resetFilters = () => {
    setSelectedFilters({});
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 text-sm font-medium"
      >
        <Filter size={16} className="text-gray-600" />
        <span>Filters</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-[500px] bg-white rounded-lg shadow-xl border z-50 animate-fade-in-down">
          <div className="flex">
            {/* Left category section */}
            <div className="w-1/3 border-r">
              {Object.keys(filterOptions).map((category) => (
                <button
                  key={category}
                  className={`flex items-center w-full px-4 py-2 text-left text-sm ${
                    activeCategory === category
                      ? "bg-purple-100 text-purple-700 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Right filter section */}
            <div className="w-2/3 p-4">
              {filterOptions[activeCategory].map((filter) => {
                const isActive = selectedFilters[activeCategory]?.includes(filter);
                return (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(activeCategory, filter)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } mb-2 mr-2`}
                  >
                    {isActive && <Check size={14} />}
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <button
              onClick={resetFilters}
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
