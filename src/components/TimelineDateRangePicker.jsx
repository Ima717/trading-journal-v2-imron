import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { useFilters } from "../context/FilterContext";
import { Popover } from "@headlessui/react";
import { DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import "react-day-picker/dist/style.css";

const presets = [
  { label: "Today", range: () => [dayjs(), dayjs()] },
  { label: "This week", range: () => [dayjs().startOf("week"), dayjs().endOf("week")] },
  { label: "This month", range: () => [dayjs().startOf("month"), dayjs().endOf("month")] },
  { label: "Last 30 days", range: () => [dayjs().subtract(30, "day"), dayjs()] },
  { label: "Last month", range: () => [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
  { label: "This quarter", range: () => [dayjs().startOf("quarter"), dayjs().endOf("quarter")] },
  { label: "YTD", range: () => [dayjs().startOf("year"), dayjs()] }
];

const TimelineDateRangePicker = () => {
  const { dateRange, setDateRange, triggerRefresh } = useFilters();
  const [selected, setSelected] = useState([dateRange.start, dateRange.end]);

  const applyRange = (start, end) => {
    setDateRange({ start: start.toDate(), end: end.toDate() });
    triggerRefresh();
  };

  return (
    <Popover className="relative z-50">
      <Popover.Button className="flex items-center gap-2 border px-3 py-2 rounded text-sm bg-white hover:bg-gray-100">
        <Calendar className="text-purple-600" size={16} />
        {dateRange.start && dateRange.end
          ? `${dayjs(dateRange.start).format("MMM DD")} - ${dayjs(dateRange.end).format("MMM DD")}`
          : "Date range"}
      </Popover.Button>

      <Popover.Panel className="absolute right-0 mt-2 bg-white shadow-xl border rounded-xl w-auto p-4 z-50">
        <div className="flex gap-6">
          {/* Calendar Range Picker */}
          <div className="flex flex-col">
            <label className="text-xs mb-1 text-gray-500">Start Date</label>
            <DayPicker
              mode="range"
              selected={selected}
              onSelect={(range) => {
                setSelected(range);
                if (range?.from && range?.to) {
                  applyRange(dayjs(range.from), dayjs(range.to));
                }
              }}
              numberOfMonths={2}
              defaultMonth={selected[0] || new Date()}
              modifiersClassNames={{
                selected: 'bg-purple-600 text-white',
                range_start: 'bg-purple-700 text-white',
                range_end: 'bg-purple-700 text-white'
              }}
              className="border rounded-lg p-2"
            />
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const [start, end] = preset.range();
                  applyRange(start, end);
                }}
                className="text-sm text-left px-2 py-1 hover:bg-gray-100 rounded"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default TimelineDateRangePicker;
