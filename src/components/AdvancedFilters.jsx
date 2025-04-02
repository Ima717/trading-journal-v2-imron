import React, { useState } from "react";
import { useFilters } from "../context/FilterContext";
import { Check, X } from "lucide-react";

const filterCategories = {
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
  const {
    selectedFilters,
    setSelectedFilters,
    triggerRefresh,
  } = useFilters();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("General");

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

  const applyFilters = () => {
    triggerRefresh(); // refresh analytics when filters applied
    setOpen(false);
  };

  const resetAll = () => {
    setSelectedFilters({});
    triggerRefresh(); // refresh analytics after reset
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 text-sm font-medium"
      >
        <span className="text-sm">Filters</span>
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-[460px] bg-white shadow-xl rounded-lg border z-50 flex flex-col overflow-hidden">
          <div className="flex h-full min-h-[260px]">
            <div className="w-1/3 border-r p-3 bg-gray-50">
              {Object.keys(filterCategories).map((category) => (
                <button
                  key={category}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${
                    activeTab === category
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setActiveTab(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="w-2/3 p-4 flex flex-wrap gap-2">
              {filterCategories[activeTab].map((filter) => {
                const isActive = selectedFilters?.[activeTab]?.includes(filter);
                return (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(activeTab, filter)}
                    className={`px-3 py-1 text-sm rounded-full border flex items-center gap-1 transition ${
                      isActive
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {isActive && <Check size={14} />}
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center px-4 py-3 border-t">
            <button
              onClick={resetAll}
              className="text-sm text-purple-600 hover:underline"
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
                className="px-4 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
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
