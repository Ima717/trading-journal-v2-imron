import React, { useState, useRef, useEffect } from "react";
import { useFilters } from "../context/FilterContext";
import { CalendarDays, ChevronDown } from "lucide-react";
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
    label: "This quarter",
    range: () => {
      const startMonth = Math.floor(dayjs().month() / 3) * 3;
      return [dayjs().month(startMonth).startOf("month"), dayjs().month(startMonth + 2).endOf("month")];
    },
  },
  { label: "YTD", range: () => [dayjs().startOf("year"), dayjs()] },
];

const DateRangePicker = () => {
  const { dateRange, setDateRange } = useFilters();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    dateRange.start && dateRange.end ? [new Date(dateRange.start), new Date(dateRange.end)] : []
  );
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyRange = (range) => {
    const [start, end] = range();
    const s = start.toDate();
    const e = end.toDate();
    setValue([s, e]);
    setDateRange({ start: s, end: e });
    setOpen(false);
  };

  const onChange = (range) => {
    if (range?.length === 2) {
      setValue(range);
      setDateRange({ start: range[0].toDate(), end: range[1].toDate() });
      setOpen(false);
    }
  };

  const reset = () => {
    setValue([]);
    setDateRange({ start: null, end: null });
  };

  return (
    <div className="relative z-50" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-100 text-sm font-medium"
      >
        <CalendarDays className="text-purple-600" size={16} />
        <span className="text-gray-700">
          {value?.length === 2
            ? `${dayjs(value[0]).format("MMM D, YYYY")} - ${dayjs(value[1]).format("MMM D, YYYY")}`
            : "Date range"}
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-[560px] bg-white border shadow-xl rounded-lg p-4 flex z-50 animate-fade-slide-down">
          <div className="border-r pr-4">
            <DatePicker
              value={value}
              onChange={onChange}
              range
              numberOfMonths={2}
              format="YYYY-MM-DD"
              className="purple"
              animations={[transition({ duration: 300 })]}
              calendarPosition="bottom-right"
              style={{ borderRadius: "0.5rem" }}
              highlightToday={true}
            />
            <div className="mt-3 text-xs text-gray-500 underline cursor-pointer hover:text-gray-700" onClick={reset}>
              ✕ Reset range
            </div>
          </div>

          <div className="flex flex-col pl-4 gap-2 w-40">
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
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
