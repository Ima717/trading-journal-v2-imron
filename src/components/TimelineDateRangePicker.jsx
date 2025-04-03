import React, { useState, useRef } from "react";
import { Popover } from "@headlessui/react";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import { useFilters } from "../context/FilterContext";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";

const TimelineDateRangePicker = () => {
  const { setDateRange } = useFilters();
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const presets = [
    { label: "Today", range: [dayjs(), dayjs()] },
    { label: "This week", range: [dayjs().startOf("week"), dayjs().endOf("week")] },
    { label: "This month", range: [dayjs().startOf("month"), dayjs().endOf("month")] },
    { label: "Last 30 days", range: [dayjs().subtract(30, "day"), dayjs()] },
    {
      label: "Last month",
      range: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
    { label: "This quarter", range: [dayjs().startOf("quarter"), dayjs().endOf("quarter")] },
    { label: "YTD", range: [dayjs().startOf("year"), dayjs()] },
  ];

  const handleRangeSelect = (selectedRange) => {
    setRange(selectedRange);
    if (selectedRange?.from && selectedRange?.to) {
      setDateRange({
        start: selectedRange.from.toISOString(),
        end: selectedRange.to.toISOString(),
      });
    }
  };

  const applyPreset = (start, end) => {
    const newRange = { from: start.toDate(), to: end.toDate() };
    setRange(newRange);
    setDateRange({
      start: start.toISOString(),
      end: end.toISOString(),
    });
    setOpen(false);
  };

  const resetAll = () => {
    setRange({ from: undefined, to: undefined });
    setDateRange({ start: null, end: null });
    setOpen(false);
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <Popover>
        {({ open: popoverOpen }) => (
          <>
            <Popover.Button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 transition duration-200"
            >
              <CalendarIcon size={16} className="text-purple-600" />
              <span className="text-gray-700">Date range</span>
            </Popover.Button>

            <AnimatePresence>
              {open && (
                <Popover.Panel static>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute top-14 right-0 w-[620px] bg-white shadow-2xl border border-gray-200 rounded-2xl overflow-hidden z-50 flex p-6 space-x-6"
                  >
                    {/* Calendar */}
                    <div className="w-2/3 border-r pr-6">
                      <p className="text-sm text-gray-500 mb-3">Select Date Range</p>
                      <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={handleRangeSelect}
                        numberOfMonths={2}
                        className="rounded-md"
                        modifiersClassNames={{
                          selected: "bg-purple-600 text-white",
                          range_start: "bg-purple-600 text-white",
                          range_end: "bg-purple-600 text-white",
                          range_middle: "bg-purple-200 text-purple-800",
                        }}
                      />
                      <button
                        onClick={resetAll}
                        className="mt-4 text-xs text-purple-600 hover:underline hover:text-purple-800 transition"
                      >
                        Reset all
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="w-1/3 flex flex-col gap-3">
                      <p className="text-sm text-gray-500 mb-1">Quick Presets</p>
                      {presets.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => applyPreset(preset.range[0], preset.range[1])}
                          className="text-left text-sm px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all duration-150"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </Popover.Panel>
              )}
            </AnimatePresence>
          </>
        )}
      </Popover>
    </div>
  );
};

export default TimelineDateRangePicker;
