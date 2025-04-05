import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

const filterData = {
  Setup: ["Breakout", "Pullback", "Reversal"],
  Market: ["Bullish", "Bearish", "Sideways"],
  Session: ["Pre-market", "Regular", "After-hours"],
};

const AdvancedFilters = () => {
  const [open, setOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilter = (category, value) => {
    setSelectedFilters((prev) => {
      const existing = prev[category] || [];
      const newValues = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      return { ...prev, [category]: newValues };
    });
  };

  const resetFilters = () => setSelectedFilters({});
  const applyFilters = () => setOpen(false);
  const cancelFilters = () => setOpen(false);

  const countSelected = Object.values(selectedFilters).flat().length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
      >
        <SlidersHorizontal size={16} />
        Filters
        {countSelected > 0 && (
          <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
            {countSelected}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-800 shadow-lg rounded-xl z-50 border border-gray-200 dark:border-zinc-700 p-4"
          >
            {Object.keys(filterData).map((category) => (
              <div key={category} className="mb-4">
                <h4 className="text-xs uppercase font-semibold mb-2 text-gray-500 dark:text-gray-400">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {filterData[category].map((item) => (
                    <label
                      key={item}
                      className={`text-sm px-3 py-1 rounded-md border cursor-pointer transition ${
                        (selectedFilters[category] || []).includes(item)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(selectedFilters[category] || []).includes(item)}
                        onChange={() => toggleFilter(category, item)}
                        className="hidden"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between border-t pt-3 mt-4">
              <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-white">
                Reset all
              </button>
              <div className="flex gap-2">
                <button
                  onClick={cancelFilters}
                  className="text-sm px-3 py-1 rounded-md bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Apply
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
