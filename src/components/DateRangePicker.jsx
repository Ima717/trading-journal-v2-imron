import React, { useState } from "react";
import { useFilters } from "../context/FilterContext";
import dayjs from "dayjs";
import { CalendarDays, ChevronDown } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/purple.css";
import transition from "react-element-popper/animations/transition";
import { motion, AnimatePresence } from "framer-motion";

const presets = [
  { label: "Today", range: () => [dayjs(), dayjs()] },
  { label: "This week", range: () => [dayjs().startOf("week"), dayjs().endOf("week")] },
  { label: "This month", range: () => [dayjs().startOf("month"), dayjs().endOf("month")] },
  { label: "Last 30 days", range: () => [dayjs().subtract(30, "day"), dayjs()] },
  { label: "Last month", range: () => [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
  { label: "This quarter", range: () => {
      const startMonth = Math.floor(dayjs().month() / 3) * 3;
      return [dayjs().month(startMonth).startOf("month"), dayjs().month(startMonth + 2).endOf("month")];
    }
  },
  { label: "YTD (year to date)", range: () => [dayjs().startOf("year"), dayjs()] },
];

const DateRangePicker = () => {
  const { dateRange, setDateRange } = useFilters();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);

  const applyRange = (range) => {
    const [start, end] = range();
    setValue([start.toDate(), end.toDate()]);
    setDateRange({ start: start.toDate(), end: end.toDate() });
    setOpen(false);
  };

  const onChange = (range) => {
    if (range?.length === 2) {
      setValue(range);
      setDateRange({ start: range[0].toDate(), end: range[1].toDate() });
      setOpen(false);
    }
  };

  return (
    <div className="relative z-40">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 text-sm font-medium"
      >
        <CalendarDays className="text-pink-600" size={16} />
        <span className="text-gray-700">Date range</span>
        <ChevronDown size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-12 right-0 flex bg-white border shadow-xl rounded-lg overflow-hidden z-50"
          >
            <div className="p-3 border-r">
              <DatePicker
                value={value}
                onChange={onChange}
                range
                numberOfMonths={2}
                format="YYYY-MM-DD"
                className="purple"
                animations={[transition()]}
                style={{ width: "300px" }}
              />
            </div>
            <div className="flex flex-col p-3 gap-2 w-44">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyRange(preset.range)}
                  className="text-left text-sm hover:bg-gray-100 px-3 py-1 rounded"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangePicker;
