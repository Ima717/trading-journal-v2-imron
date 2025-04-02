import React, { useState } from "react";
import { useFilters } from "../context/FilterContext";
import { CalendarDays } from "lucide-react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

const presets = [
  { label: "Today", range: () => [dayjs(), dayjs()] },
  { label: "This Week", range: () => [dayjs().startOf("week"), dayjs().endOf("week")] },
  { label: "This Month", range: () => [dayjs().startOf("month"), dayjs().endOf("month")] },
  { label: "Last 30 Days", range: () => [dayjs().subtract(30, "day"), dayjs()] },
  { label: "This Quarter", range: () => {
    const month = dayjs().month();
    const startMonth = Math.floor(month / 3) * 3;
    return [dayjs().month(startMonth).startOf("month"), dayjs().month(startMonth + 2).endOf("month")];
  }},
  { label: "YTD", range: () => [dayjs().startOf("year"), dayjs()] },
];

const TimelineDateRangePicker = () => {
  const { setDateRange } = useFilters();
  const [open, setOpen] = useState(false);

  const handlePresetClick = (rangeFn) => {
    const [start, end] = rangeFn();
    setDateRange({ start: start.toDate(), end: end.toDate() });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md shadow hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
      >
        <CalendarDays className="text-purple-600" size={16} />
        Date range
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 mt-2 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg w-64 p-3"
          >
            <div className="flex flex-col gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.range)}
                  className="text-sm text-left px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setDateRange({ start: null, end: null });
                  setOpen(false);
                }}
                className="text-xs text-red-500 mt-2 hover:underline"
              >
                Reset Date Filter ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineDateRangePicker;
