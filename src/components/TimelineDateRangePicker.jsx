import React, { useState, useRef } from "react";
import { Popover } from "@headlessui/react";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import { useFilters } from "../context/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

const TimelineDateRangePicker = () => {
  const [range, setRange] = useState({ from: null, to: null });
  const { setDateRange, triggerRefresh } = useFilters();
  const containerRef = useRef(null);
  const today = new Date();

  const handleDateSelect = (selectedRange) => {
    setRange(selectedRange);
    if (selectedRange?.from && selectedRange?.to) {
      setDateRange({
        start: selectedRange.from.toISOString(),
        end: selectedRange.to.toISOString(),
      });
      triggerRefresh();
    }
  };

  const handlePreset = (preset) => {
    const now = dayjs();
    let from, to;

    switch (preset) {
      case "Today": from = to = now; break;
      case "This week": from = now.startOf("week"); to = now.endOf("week"); break;
      case "This month": from = now.startOf("month"); to = now.endOf("month"); break;
      case "Last 30 days": from = now.subtract(30, "day"); to = now; break;
      case "Last month":
        from = now.subtract(1, "month").startOf("month");
        to = now.subtract(1, "month").endOf("month");
        break;
      case "This quarter": from = now.startOf("quarter"); to = now.endOf("quarter"); break;
      case "YTD": from = now.startOf("year"); to = now; break;
      default: return;
    }

    const fromDate = from.toDate();
    const toDate = to.toDate();
    setRange({ from: fromDate, to: toDate });
    setDateRange({ start: fromDate.toISOString(), end: toDate.toISOString() });
    triggerRefresh();
  };

  const resetDates = () => {
    setRange({ from: null, to: null });
    setDateRange({ start: null, end: null });
    triggerRefresh();
  };

  const isToday = (date) => dayjs(date).isSame(today, "day");
  const isFuture = (date) => dayjs(date).isAfter(today, "day");

  const modifiers = {
    today: isToday,
    future: isFuture,
  };

  const modifiersClassNames = {
    today: "ring-2 ring-purple-400",
    future: "text-gray-400 pointer-events-none opacity-50",
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="absolute top-12 right-0 w-[500px] bg-white border rounded-xl shadow-2xl flex z-50"
              >
                {/* Calendar Section */}
                <div className="w-2/3 px-4 py-4">
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleDateSelect}
                    numberOfMonths={1}
                    toDate={today}
                    modifiers={modifiers}
                    disabled={isFuture}
                    modifiersClassNames={modifiersClassNames}
                    classNames={{
                      months: "flex flex-col gap-2",
                      caption: "flex justify-between items-center mb-2 px-2 text-sm font-medium",
                      head_row: "grid grid-cols-7",
                      head_cell: "text-gray-500 font-medium text-xs text-center",
                      row: "grid grid-cols-7",
                      day: "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 ease-in-out hover:bg-purple-50",
                      day_selected: "bg-purple-600 text-white rounded-full scale-105 shadow-sm transition",
                      day_range_start: "bg-purple-600 text-white rounded-full transition",
                      day_range_end: "bg-purple-600 text-white rounded-full transition",
                      day_range_middle: "bg-purple-100 text-purple-800 transition",
                      today: "ring-2 ring-purple-400",
                      disabled: "text-gray-300 pointer-events-none opacity-50",
                    }}
                  />
                  <button
                    onClick={resetDates}
                    className="mt-3 text-xs text-purple-600 hover:underline transition"
                  >
                    Reset all
                  </button>
                </div>

                {/* Presets Section */}
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
                      className="w-full text-left px-3 py-2 rounded hover:bg-purple-100 transition-all duration-200"
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
