import React, { useState } from "react";
import { useFilters } from "../context/FilterContext";
import DatePicker from "react-multi-date-picker";
import dayjs from "dayjs";
import transition from "react-element-popper/animations/transition";
import { CalendarDays, ChevronDown } from "lucide-react";

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

  const onApply = (range) => {
    const [start, end] = range;
    setDateRange({ start, end });
    setOpen(false);
  };

  const onPreset = (presetFn) => {
    const [start, end] = presetFn();
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
        <CalendarDays className="text-purple-600" size={16} />
        <span className="text-gray-700">
          {value?.length === 2
            ? `${dayjs(value[0]).format("MMM D, YYYY")} - ${dayjs(value[1]).format("MMM D, YYYY")}`
            : "Date range"}
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute top-12 right-0 flex bg-white border shadow-xl rounded-lg overflow-hidden animate-fade-slide-down z-50">
          <div className="p-4 border-r">
            <div className="text-xs text-gray-600 font-medium mb-1">Start Date — End Date</div>
            <DatePicker
              value={value}
              onChange={onChange}
              range
              numberOfMonths={2}
              format="YYYY-MM-DD"
              className="purple"
              animations={[transition({ duration: 300 })]}
              style={{
                border: "none",
                boxShadow: "none",
                borderRadius: "8px",
                padding: "4px",
              }}
            />
          </div>
          <div className="flex flex-col p-4 gap-2 w-48">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => onPreset(preset.range)}
                className="text-left text-sm hover:bg-purple-100 text-gray-700 px-3 py-1 rounded"
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
