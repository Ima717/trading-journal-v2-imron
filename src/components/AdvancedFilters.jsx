import React, { useEffect, useRef, useState } from "react";
import { Filter } from "lucide-react";
import { useFilters } from "../context/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

const categories = {
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
  Tags: ["Mistakes", "Sucesses"],
};

const AdvancedFilters = () => {
  const { setClickedTag, triggerRefresh } = useFilters();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("General");
  const [selected, setSelected] = useState({});
  const dropdownRef = useRef(null);

  const toggleFilter = (cat, item) => {
    setSelected((prev) => {
      const current = prev[cat] || [];
      const isActive = current.includes(item);
      const updated = isActive
        ? current.filter((f) => f !== item)
        : [...current, item];
      return { ...prev, [cat]: updated };
    });
  };

  const resetAll = () => {
    setSelected({});
    setClickedTag(null);
    triggerRefresh(); // Refresh dashboard after reset
  };

  const applyFilters = () => {
    const flat = Object.values(selected).flat();
    if (flat.length > 0) setClickedTag(flat[0]);
    else setClickedTag(null);
    setOpen(false);
  };

  useEffect(() => {
    const closeOnOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 border rounded shadow-sm hover:bg-gray-100 text-sm font-medium bg-white"
      >
        <Filter size={16} className="text-purple-600" />
        <span>Filters</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute top-12 right-0 w-[420px] bg-white border shadow-xl rounded-lg overflow-hidden"
          >
            <div className="flex h-[300px]">
              {/* Sidebar Tabs */}
              <div className="w-1/3 border-r bg-gray-50">
                {Object.keys(categories).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-3 text-sm font-medium ${
                      activeTab === tab
                        ? "bg-purple-100 text-purple-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Filter Options with transition animation */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-2/3 p-4 flex flex-col gap-2 overflow-y-auto"
              >
                {categories[activeTab].map((filter) => {
                  const isActive = selected[activeTab]?.includes(filter);
                  return (
                    <button
                      key={filter}
                      onClick={() => toggleFilter(activeTab, filter)}
                      className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1 whitespace-nowrap ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </motion.div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center p-3 border-t bg-gray-50">
              <button
                onClick={resetAll}
                className="text-xs text-purple-600 hover:underline"
              >
                Reset all
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="bg-purple-600 text-white text-sm px-4 py-1 rounded hover:bg-purple-700"
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
