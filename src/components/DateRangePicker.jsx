import React, { useState, useEffect, useRef } from "react";
import { useFilters } from "../context/FilterContext";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import transition from "react-element-popper/animations/transition";
import dayjs from "dayjs";
import "react-multi-date-picker/styles/colors/purple.css";

const presets = [
  { label: "Today", range: () => [dayjs(), dayjs()] },
  { label: "This week", range: () => [dayjs().startOf("week"), dayjs().endOf("week")] },
  { label: "This month", range: () => [dayjs().startOf("month"), dayjs().endOf("month")] },
  { label: "Last 30 days", range: () => [dayjs().subtract(30, "day"), dayjs()] },
  {
    label: "This quarter",
    range: () => {
      const startMonth = Math.floor(dayjs().month() / 3) * 3;
      return [
        dayjs().month(startMonth).startOf("month"),
        dayjs().month(startMonth + 2).endOf("month"),
      ];
    },
  },
  { label: "YTD", range: () => [dayjs().startOf("year"), dayjs()] },
];

const DateRangePicker = () => {
  const { dateRange, setDateRange } = useFilters();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    dateRange.start && dateRange.end
      ? [new Date(dateRange.start), new Date(dateRange.end)]
      : []
  );
  const ref = useRef();

  const applyRange = (rangeFn) => {
    const [start, end] = rangeFn();
    const startDate = start.toDate();
    const endDate = end.toDate();
    setValue([startDate, endDate]);
    setDateRange({ start: startDate, end: endDate });
    setOpen(false);
  };

  const handleChange = (range) => {
    if (range?.length === 2) {
      setValue(range);
      setDateRange({ start: range[0].toDate(), end: range[1].toDate() });
      setOpen(false);
    }
  };

  const handleReset = () => {
    setValue([]);
    setDateRange({ start: null, end: null });
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-40" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 text-sm font-medium"
      >
        <CalendarDays size={16} className="text-purple-600" />
        <span className="text-gray-700">
          {value?.length === 2
            ? `${dayjs(value[0]).format("MMM D")} - ${dayjs(value[1]).format("MMM D")}`
            : "Date range"}
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute top-12 right-0 flex bg-white border shadow-xl rounded-lg overflow-hidden animate-fade-in-down z-50">
          <div className="p-3 border-r">
            <DatePicker
              value={value}
              onChange={handleChange}
              range
              numberOfMonths={2}
              format="YYYY-MM-DD"
              className="purple"
              animations={[transition()]}
              calendarPosition="bottom-right"
              style={{ width: "300px", height: "auto" }}
            />
          </div>
          <div className="flex flex-col p-3 gap-2 w-40">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyRange(preset.range)}
                className="text-left text-sm hover:bg-gray-100 px-3 py-1 rounded"
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-red-500 hover:underline pt-2"
            >
              <X size={12} /> Reset Date Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
