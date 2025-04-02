import React, { useState } from "react";
import { ChevronDown, Check, AlertTriangle } from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { useFilters } from "../context/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

const filterCategories = {
  Result: ["Win", "Loss", "Breakeven"],
  General: ["Reviewed", "Unreviewed", "Open", "Closed"],
  Tags: ["Breakout", "Reversal", "News Play", "Overtraded", "Perfect"],
  Playbook: ["A+ Setup", "B Setup", "C Setup"],
};

const dropdownAnimation = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const AdvancedFilters = () => {
  const [open, setOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [hasError, setHasError] = useState(false);
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
    setHasError(false);
  };

  const applyFilters = () => {
    try {
      const tags = Object.values(selectedFilters).flat();
      if (tags.length) setClickedTag(tags[0]);
      else setClickedTag(null);
      setHasError(false);
      setOpen(false);
    } catch (err) {
      console.error("Error applying filters:", err);
      setHasError(true);
    }
  };

  return (
    <div className="relative z-40 text-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 transition"
      >
        <FaFilter className="text-indigo-600" size={14} />
        <span className="text-gray-800">Filters</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownAnimation}
            className="absolute right-0 top-12 w-[360px] bg-white shadow-2xl rounded-lg border p-4"
          >
            {Object.entries(filterCategories).map(([category, filters]) => (
              <div key={category} className="mb-4">
                <div className="font-semibold text-gray-700 mb-1">{category}</div>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => {
                    const active = selectedFilters[category]?.includes(filter);
                    return (
                      <button
                        key={filter}
                        onClick={() => toggleFilter(category, filter)}
                        className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1 transition ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {active && <Check size={12} />}
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasError && (
              <div className="flex items-center gap-2 text-red-600 text-xs mt-2">
                <AlertTriangle size={14} /> Failed to load filters. Please try again.
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
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedFilters;
