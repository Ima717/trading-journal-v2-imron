import React, { useState, useRef } from "react";
import { Popover, Transition } from "@headlessui/react";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import { useFilters } from "../context/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

const TimelineDateRangePicker = () => {
  const [range, setRange] = useState({ from: null, to: null });
  const { setDateRange, triggerRefresh } = useFilters();
  const today = new Date();
  const containerRef = useRef(null);

  const handleDateSelect = (selectedRange) => {
    if (
      selectedRange?.from &&
      selectedRange?.to &&
      selectedRange.from <= today &&
      selectedRange.to <= today
    ) {
      setRange(selectedRange);
      setDateRange({
        start: selectedRange.from.toISOString(),
        end: selectedRange.to.toISOString(),
      });
      triggerRefresh();
    }
  };

  const handlePreset = (preset) => {
    const today = dayjs();
    let from, to;
    switch (preset) {
      case "Today":
        from = to = today;
        break;
      case "This week":
        from = today.startOf("week");
        to = today.endOf("week");
        break;
      case "This month":
        from = today.startOf("month");
        to = today.endOf("month");
        break;
      case "Last 30 days":
        from = today.subtract(30, "day");
        to = today;
        break;
      case "Last month":
        from = today.subtract(1, "month").startOf("month");
        to = today.subtract(1, "month").endOf("month");
        break;
      case "This quarter":
        from = today.startOf("quarter");
        to = today.endOf("quarter");
        break;
      case "YTD":
        from = today.startOf("year");
        to = today;
        break;
      default:
        return;
    }

    const fromDate = from.toDate();
    const toDate = to.toDate();

    setRange({ from: fromDate, to: toDate });
    setDateRange({
      start: fromDate.toISOString(),
      end: toDate.toISOString(),
    });
    triggerRefresh();
  };

  const resetDates = () => {
    setRange({ from: null, to: null });
    setDateRange({ start: null, end: null });
    triggerRefresh();
  };

  return (
    <Popover className="relative z-50">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex items-center gap-2 px-4 py-2 border rounded shadow-sm bg-white text-sm font-medium transition-all duration-200 ${
              open ? "border-purple-600 ring-1 ring-purple-400" : "hover:bg-gray-100"
            }`}
          >
            <CalendarIcon size={16} className="text-purple-600" />
            <span>Date range</span>
            {range.from && range.to && (
              <span className="ml-1 text-xs text-gray-500">
                {dayjs(range.from).format("MMM DD")} - {dayjs(range.to).format("MMM DD")}
              </span>
            )}
          </Popover.Button>

          <AnimatePresence>
            {open && (
              <Popover.Panel
                static
                as={motion.div}
                ref={containerRef}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute top-12 right-0 w-[520px] bg-white border rounded-xl shadow-xl flex z-50 overflow-hidden"
              >
                {/* Calendar */}
                <div className="w-2/3 px-4 py-4">
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleDateSelect}
                    numberOfMonths={1}
                    toDate={today}
                    modifiers={{ today }}
                    classNames={{
                      months: "flex flex-col",
                      caption: "flex justify-between items-center mb-2 px-2",
                      nav_button:
                        "p-1 rounded hover:bg-purple-100 text-purple-600 transition",
                      day_selected:
                        "bg-purple-600 text-white rounded-full transition-all scale-105 shadow-md",
                      day_range_middle: "bg-purple-200 text-purple-800",
                      day_range_start:
                        "bg-purple-600 text-white rounded-full shadow-sm scale-105",
                      day_range_end:
                        "bg-purple-600 text-white rounded-full shadow-sm scale-105",
                      day_today:
                        "ring-2 ring-purple-400 ring-opacity-50 rounded-full",
                      day: "p-2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-150 ease-in-out hover:bg-purple-50 disabled:opacity-30 disabled:pointer-events-none",
                      head_cell: "text-gray-500 font-medium text-xs",
                    }}
                  />
                  <button
                    onClick={resetDates}
                    className="mt-3 text-xs text-purple-600 hover:underline transition duration-150"
                  >
                    Reset all
                  </button>
                </div>

                {/* Presets */}
                <div className="w-1/3 border-l px-4 py-4 space-y-2 text-sm">
                  {[
                    "Today",
                    "This week",
                    "This month",
                    "Last 30 days",
                    "Last month",
                    "This quarter",
                    "YTD",
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePreset(preset)}
                      className="w-full text-left px-3 py-1.5 rounded hover:bg-purple-50 transition-all duration-150 ease-in-out"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </Popover.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Popover>
  );
};

export default TimelineDateRangePicker;
