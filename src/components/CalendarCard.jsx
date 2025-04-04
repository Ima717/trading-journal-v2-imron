import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import dayjs from "dayjs";

const CalendarCard = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();

  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  const handlePrevMonth = () => setCurrentMonth((prev) => prev.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth((prev) => prev.add(1, "month"));

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200/60 p-5 shadow-lg w-full h-full min-h-[580px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md font-semibold text-gray-800 dark:text-white">
          {currentMonth.format("MMMM YYYY")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 text-sm text-center text-gray-500 dark:text-gray-400 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Animated Days */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.format("YYYY-MM")}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="grid grid-cols-7 gap-2 text-sm text-gray-800 dark:text-white flex-1"
        >
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((date) => (
            <div
              key={date.format("YYYY-MM-DD")}
              className="rounded-lg h-[60px] hover:bg-purple-100/60 dark:hover:bg-purple-900/30 transition-colors flex items-center justify-center cursor-pointer border border-transparent hover:border-purple-400 dark:hover:border-purple-600"
            >
              {date.date()}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarCard;
