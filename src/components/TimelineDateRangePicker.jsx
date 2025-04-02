import React, { useState } from "react";
import { Popover } from "@headlessui/react";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useFilters } from "../context/FilterContext";
import dayjs from "dayjs";
import { addMonths } from "date-fns";

const TimelineDateRangePicker = () => {
  const { dateRange, setDateRange } = useFilters();
  const [range, setRange] = useState({ from: null, to: null });
  const [month, setMonth] = useState(new Date());

  const presets = [
    { label: "Today", range: [dayjs(), dayjs()] },
    { label: "This week", range: [dayjs().startOf("week"), dayjs().endOf("week")] },
    { label: "This month", range: [dayjs().startOf("month"), dayjs().endOf("month")] },
    { label: "Last 30 days", range: [dayjs().subtract(30, "day"), dayjs()] },
    { label: "Last month", range: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
    { label: "This quarter", range: [dayjs().startOf("quarter"), dayjs().endOf("quarter")] },
    { label: "YTD", range: [dayjs().startOf("year"), dayjs()] },
  ];

  const handleStartSelect = (date) => {
    setRange({ ...range, from: date });
  };

  const handleEndSelect = (date) => {
    setRange((prev) => {
      const newRange = { ...prev, to: date };
      if (newRange.from && newRange.to) {
        setDateRange({ start: newRange.from.toISOString(), end: newRange.to.toISOString() });
      }
      return newRange;
    });
  };

  const applyPreset = (start, end) => {
    setRange({ from: start.toDate(), to: end.toDate() });
    setDateRange({ start: start.toISOString(), end: end.toISOString() });
  };

  return (
    <Popover className="relative z-40">
      <Popover.Button className="flex items-center gap-1 px-4 py-2 bg-white border rounded shadow-sm text-sm font-medium hover:bg-gray-100">
        <CalendarIcon size={16} className="text-purple-600" />
        <span>Date range</span>
      </Popover.Button>

      <Popover.Panel className="absolute z-50 mt-2 w-[680px] right-0 bg-white border shadow-xl rounded-xl p-4 flex">
        {/* Dual Calendars */}
        <div className="flex gap-6 border-r pr-6">
          {/* Start Date */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Start Date</p>
            <DayPicker
              mode="single"
              selected={range.from}
              onSelect={handleStartSelect}
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={1}
              className="rounded-lg border"
            />
          </div>

          {/* End Date */}
          <div>
            <p className="text-sm text-gray-500 mb-1">End Date</p>
            <DayPicker
              mode="single"
              selected={range.to}
              onSelect={handleEndSelect}
              month={addMonths(month, 1)}
              numberOfMonths={1}
              className="rounded-lg border"
            />
          </div>
        </div>

        {/* Presets */}
        <div className="pl-6">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.range[0], preset.range[1])}
              className="block w-full text-left text-sm py-1 px-2 rounded hover:bg-gray-100"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default TimelineDateRangePicker;
