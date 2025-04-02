import React, { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useFilters } from "../context/FilterContext";
import dayjs from "dayjs";
import DatePicker from "react-multi-date-picker";
import transition from "react-element-popper/animations/transition";
import "react-multi-date-picker/styles/colors/purple.css";

const presets = [
  { label: "Today", range: () => [dayjs(), dayjs()] },
  { label: "This week", range: () => [dayjs().startOf("week"), dayjs().endOf("week")] },
  { label: "This month", range: () => [dayjs().startOf("month"), dayjs().endOf("month")] },
  { label: "Last 30 days", range: () => [dayjs().subtract(30, "day"), dayjs()] },
  { label: "Last month", range: () => [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
  {
    label: "This quarter", range: () => {
      const startMonth = Math.floor(dayjs().month() / 3) * 3;
      return [dayjs().month(startMonth).startOf("month"), dayjs().month(startMonth + 2).endOf("month")];
    }
  },
  { label: "YTD", range: () => [dayjs().startOf("year"), dayjs()] },
];

const DateRangePicker = () => {
  const { dateRange, setDateRange } = useFilters();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    dateRange.start && dateRange.end ? [new Date(dateRange.start), new Date(dateRange.end)] : []
  );

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

  const resetRange = () => {
    setValue([]);
    setDateRange({ start: null, end: null });
    setOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 text-sm font-medium"
      >
        <CalendarDays className="text-purple-600" size={16} />
        <span className="text-gray-800">Date range</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute top-12 right-0 bg-white border shadow-xl rounded-lg flex z-50 animate-slide-down-fade transition-all duration-300">
          <div className="p-4">
            <DatePicker
              value={value}
              onChange={onChange}
              range
              numberOfMonths={2}
              format="YYYY-MM-DD"
              className="purple"
              animations={[transition({ duration: 300 })]}
              calendarPosition="bottom-left"
              style={{ border: "none", boxShadow: "none" }}
            />
          </div>
          <div className="w-[1px] mx-2 bg-gray-200 opacity-60 rounded-full" />
          <div className="p-4 flex flex-col gap-2 w-40">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyRange(preset.range)}
                className="text-left text-sm text-gray-800 hover:text-purple-600 hover:font-medium transition"
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={resetRange}
              className="text-xs text-gray-500 underline hover:text-red-600 mt-2"
            >
              ✕ Reset range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
