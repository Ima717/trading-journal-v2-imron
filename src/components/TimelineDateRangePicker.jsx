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
  const [month, setMonth] = useState(new Date()); // Track the currently displayed month
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
    } else if (selectedRange?.from) {
      // If only one date is selected, set it as both start and end
      setDateRange({
        start: selectedRange.from.toISOString(),
        end: selectedRange.from.toISOString(),
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
    setMonth(fromDate); // Update the displayed month to the start of the preset range
    triggerRefresh();
  };

  const resetDates = () => {
    setRange({ from: null, to: null });
    setDateRange({ start: null, end: null });
    setMonth(new Date()); // Reset to current month
    triggerRefresh();
  };

  const isToday = (date) => dayjs(date).isSame(today, "day");
  const isFuture = (date) => dayjs(date).isAfter(today, "day");

  const modifiers = {
    today: isToday,
    future: isFuture,
  };

  const modifiersClassNames = {
    today: "ring-2 ring-purple-500 ring-opacity-50", // Tiny ring for today's date
    future: "text-gray-400 pointer-events-none opacity-40", // Disable future dates
  };

  // Prevent page jump by maintaining scroll position
  const handleRefreshWithoutJump = () => {
    const scrollPosition = window.scrollY;
    triggerRefresh();
    window.scrollTo(0, scrollPosition);
  };

  return (
    <Popover className="relative z-50">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`flex items-center gap-2 px-4 py-2 border rounded shadow-sm bg-white text-sm font-medium transition-all duration-200 ${
              open ? "border-purple-600 ring-1 ring-purple-400" : "hover:bg-gray-100"
            }`}
          >
            <CalendarIcon size={16} className="text-purple-600" />
            <span>Date range</span>
            {range?.from && (
              <span className="ml-1 text-xs text-gray-500">
                {dayjs(range.from).format("MMM DD")}
                {range.to && ` - ${dayjs(range.to).format("MMM DD")}`}
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
                {/* Calendar */}
                <div className="w-2/3 px-4 py-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Select Date Range</h4>
                  <motion.div
                    key={month.toISOString()} // Key changes when month changes, triggering animation
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <DayPicker
                      mode="range"
                      selected={range}
                      onSelect={(selectedRange) => {
                        handleDateSelect(selectedRange);
                        if (selectedRange?.from && selectedRange?.to) {
                          close(); // Close the popover after selecting a range
                        }
                      }}
                      month={month}
                      onMonthChange={setMonth}
                      numberOfMonths={1} // Ensure only one month is displayed
                      modifiers={modifiers}
                      disabled={isFuture}
                      modifiersClassNames={modifiersClassNames}
                      className="text-sm transition-all"
                      classNames={{
                        months: "flex flex-col gap-4",
                        month: "w-full", // Let DayPicker handle the grid layout
                        caption: "flex justify-between items-center mb-2 px-2",
                        nav_button: "p-1 rounded hover:bg-purple-100 text-purple-600 transition",
                        day_selected: range?.from && !range?.to 
                          ? "bg-purple-600 text-white rounded-lg transition-all shadow-md" // Single date: purple square with rounded corners
                          : "bg-purple-600 text-white rounded-full transition-all shadow-md", // Range: rounded circle
                        day_range_middle: "bg-purple-100 text-purple-800 transition-all shadow-sm", // Shadow for range middle
                        day_range_start: "bg-purple-600 text-white rounded-full transition-all shadow-md",
                        day_range_end: "bg-purple-600 text-white rounded-full transition-all shadow-md",
                        day: "p-2 transition-all duration-150 ease-in-out rounded-full", // Base day styling
                        day_hover: "hover:bg-purple-200 hover:shadow-sm hover:scale-105", // Hover animation for selectable dates
                        head_cell: "text-gray-500 font-medium text-xs w-9", // Adjusted width for header cells
                        head_row: "", // Let DayPicker handle the default layout
                        row: "", // Let DayPicker handle the default layout
                      }}
                      styles={{
                        month: {
                          width: "100%", // Ensure the month container is wide enough
                          padding: "0 8px", // Reduced padding to make it smaller
                        },
                        day: {
                          transition: "all 0.2s ease-in-out", // Smooth transition for hover effects
                          width: "32px", // Reduced size for smaller calendar
                          height: "32px", // Reduced size for smaller calendar
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 2px", // Add margin between days for better spacing
                          fontSize: "0.875rem", // Slightly smaller font size
                        },
                        day_range_middle: {
                          background: "rgba(147, 51, 234, 0.1)", // Light purple for range middle
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Shadow for range middle
                          transition: "background 0.3s ease-in-out, box-shadow 0.3s ease-in-out", // Smooth range animation
                        },
                        caption_label: {
                          fontSize: "0.875rem", // Smaller caption font size
                        },
                      }}
                    />
                  </motion.div>
                  <button
                    onClick={() => {
                      resetDates();
                      close();
                    }}
                    className="mt-2 text-xs text-purple-600 hover:underline transition"
                  >
                    Reset all
                  </button>
                </div>

                {/* Preset Buttons */}
                <div className="w-1/3 border-l px-3 py-3 space-y-1 text-sm">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Presets</h4>
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
                      onClick={() => {
                        handlePreset(preset);
                        close();
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-purple-100 transition-all duration-200 text-xs"
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
