import React, { useState, useEffect, useRef } from "react";
import { useFilters } from "../context/FilterContext";
import { Check, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const filterConfig = {
  General: [
    "Instrument", "Intraday/Multiday", "Open/Closed", "Reviewed/Unreviewed",
    "Side", "Symbol", "Status", "Trade rating",
  ],
  Tags: ["Mistakes", "Successes"],
};

const AdvancedFilters = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("General");
  const [selected, setSelected] = useState({});
  const [presets, setPresets] = useState([]);
  const { triggerRefresh } = useFilters();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("filterPresets");
    if (saved) setPresets(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  const toggleOption = (tab, value) => {
    setSelected((prev) => {
      const current = prev[tab] || [];
      const exists = current.includes(value);
      const updated = exists
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [tab]: updated };
    });
  };

  const resetAll = () => {
    setSelected({});
    triggerRefresh();
  };

  const applyFilters = () => {
    setOpen(false);
    triggerRefresh();
  };

  const savePreset = () => {
    const name = prompt("Enter preset name:");
    if (!name) return;
    const newPresets = [...presets, { name, selected }];
    setPresets(newPresets);
    localStorage.setItem("filterPresets", JSON.stringify(newPresets));
  };

  const badgeCount = Object.values(selected).flat().length;

  return (
    <div className="relative z-40" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2 bg-white border rounded shadow-sm text-sm font-medium hover:bg-gray-100 relative"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Filter className="text-purple-600" size={16} />
        <span>Filters</span>
        {badgeCount > 0 && (
          <span className="ml-2 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
            {badgeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute top-12 right-0 w-[400px] bg-white shadow-2xl border rounded-xl overflow-hidden z-50"
            role="dialog"
            aria-label="Advanced filters"
          >
            <div className="flex h-full">
              {/* Sidebar Tabs */}
              <div className="w-1/3 border-r">
                {Object.keys(filterConfig).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      activeTab === tab ? "bg-purple-100 font-semibold text-purple-700" : "hover:bg-gray-100"
                    } transition-colors duration-200`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Filter Options */}
              <div className="w-2/3 p-3 overflow-y-auto max-h-[260px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.25, 1, 0.5, 1]
                    }}
                    layout
                    layoutRoot
                    className="space-y-2"
                  >
                    {filterConfig[activeTab].map((item) => {
                      const selectedItems = selected[activeTab] || [];
                      const isSelected = selectedItems.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggleOption(activeTab, item)}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-full border ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-600"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                          }`}
                        >
                          {item}
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t px-4 py-3">
              <button onClick={resetAll} className="text-xs text-purple-600 hover:underline">
                Reset all
              </button>
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)} className="text-sm text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
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
