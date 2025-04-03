import React, { useState, useRef } from "react";
import { Popover } from "@headlessui/react";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { useFilters } from "../context/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

// Utility function to generate days for a given month
const generateCalendarDays = (month, year) => {
  const firstDayOfMonth = dayjs(`${year}-${month + 1}-01`).day();
  const daysInMonth = dayjs(`${year}-${month + 1}-01`).daysInMonth();
  const days = [];

  // Add empty slots for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};

const CustomDateRangePicker = () => {
  const [range, setRange] = useState({ from: null, to: null });
  const [currentMonth, setCurrentMonth] = useState(dayjs().month()); // 0-11
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [direction, setDirection] = useState(0); // Track direction: 1 for next, -1 for previous
  const { setDateRange, triggerRefresh } = useFilters();
  const containerRef = useRef(null);

  const today = dayjs();
  const days = generateCalendarDays(currentMonth, currentYear);

  const handleDateClick = (day) => {
    const selectedDate = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
    if (selectedDate.isAfter(today, "day")) return; // Disable future dates

    if (!range.from || (range.from && range.to)) {
      // Start a new range
      setRange({ from: selectedDate.toDate(), to: null });
      setDateRange({
        start: selectedDate.toISOString(),
        end: selectedDate.toISOString(),
      });
      triggerRefresh();
    } else if (range.from && !range.to) {
      // Complete the range
      const fromDate = dayjs(range.from);
      if (selectedDate.isBefore(fromDate)) {
        // If the second date is before the first, swap them
        setRange({ from: selectedDate.toDate(), to: fromDate.toDate() });
        setDateRange({
          start: selectedDate.toISOString(),
          end: fromDate.toISOString(),
        });
      } else {
        setRange({ from: range.from, to: selectedDate.toDate() });
        setDateRange({
          start: fromDate.toISOString(),
          end: selectedDate.toISOString(),
        });
      }
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

    setRange({ from: from.toDate(), to: to.toDate() });
    setDateRange({
      start: from.toISOString(),
      end: to.toISOString(),
    });

    // Determine direction for animation based on the preset
    const fromMonth = from.month();
    const fromYear = from.year();
    if (fromYear < currentYear || (fromYear === currentYear && fromMonth < currentMonth)) {
      setDirection(-1); // Going to a previous month
    } else if (fromYear > currentYear || (fromYear === currentYear && fromMonth > currentMonth)) {
      setDirection(1); // Going to a next month
    } else {
      setDirection(0); // No month change (e.g., "Today")
    }

    setCurrentMonth(fromMonth);
    setCurrentYear(fromYear);
    triggerRefresh();
  };

  const resetDates = () => {
    setRange({ from: null, to: null });
    setDateRange({ start: null, end: null });
    setCurrentMonth(today.month());
    setCurrentYear(today.year());
    setDirection(0); // Reset direction
    triggerRefresh();
  };

  const handleMonthChange = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setDirection(direction); // Set direction for animation
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const isToday = (day) => {
    const date = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
    return date.isSame(today, "day");
  };

  const isFuture = (day) => {
    const date = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
    return date.isAfter(today, "day");
  };

  const isInRange = (day) => {
    if (!range.from || !range.to || !day) return false;
    const date = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
    return date.isAfter(dayjs(range.from), "day") && date.isBefore(dayjs(range.to), "day");
  };

  const isRangeStart = (day) => {
    if (!range.from || !day) return false;
    const date = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
    return date.isSame(dayjs(range.from), "day");
  };

  const isRangeEnd = (day) => {
    if (!range.to || !day) return false;
    const date = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
    return date.isSame(dayjs(range.to), "day");
  };

  const isSelected = (day) => {
    if (!range.from || !day) return false;
    const date = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
    return date.isSame(dayjs(range.from), "day") && !range.to;
  };

  // Animation variants for directional sliding
  const slideVariants = {
    initial: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 20 : -20, // Slide in from right if going forward, left if going backward
    }),
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -20 : 20, // Slide out to left if going forward, right if going backward
    }),
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

          <AnimatePresence mode="wait" custom={direction}>
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
                  <div className="flex justify-between items-center mb-2 px-2">
                    <button
                      onClick={() => handleMonthChange(-1)}
                      className="p-1 rounded hover:bg-purple-100 text-purple-600 transition"
                    >
                      &lt;
                    </button>
                    <motion.span
                      key={`${currentMonth}-${currentYear}-label`}
                      custom={direction}
                      variants={slideVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="text-sm font-medium"
                    >
                      {dayjs(`${currentYear}-${currentMonth + 1}-01`).format("MMMM YYYY")}
                    </motion.span>
                    <button
                      onClick={() => handleMonthChange(1)}
                      className="p-1 rounded hover:bg-purple-100 text-purple-600 transition"
                    >
                      &gt;
                    </button>
                  </div>
                  <motion.div
                    key={`${currentMonth}-${currentYear}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="grid grid-cols-7 gap-1">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-xs text-gray-500 font-medium text-center w-8"
                        >
                          {day}
                        </div>
                      ))}
                      {days.map((day, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all duration-150 ease-in-out
                            ${day ? "cursor-pointer" : "cursor-default"}
                            ${isFuture(day) ? "text-gray-400 pointer-events-none opacity-40" : ""}
                            ${isToday(day) ? "ring-2 ring-purple-500 ring-opacity-50" : ""}
                            ${isSelected(day) ? "bg-purple-600 text-white rounded-lg shadow-md" : ""}
                            ${isRangeStart(day) ? "bg-purple-600 text-white rounded-full shadow-md" : ""}
                            ${isRangeEnd(day) ? "bg-purple-600 text-white rounded-full shadow-md" : ""}
                            ${isInRange(day) ? "bg-purple-100 text-purple-800 shadow-sm" : ""}
                            ${!isFuture(day) && !isSelected(day) && !isRangeStart(day) && !isRangeEnd(day) && !isInRange(day) ? "hover:bg-purple-200 hover:shadow-sm hover:scale-105" : ""}
                          `}
                          onClick={() => {
                            if (day && !isFuture(day)) {
                              handleDateClick(day);
                              if (range.from && range.to) {
                                close();
                              }
                            }
                          }}
                        >
                          {day || ""}
                        </div>
                      ))}
                    </div>
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

export default CustomDateRangePicker;
