import React, { useState } from "react";
import dayjs from "dayjs";
import clsx from "clsx";

const generateDays = (start, end) => {
  const days = [];
  let current = start.startOf("month");
  while (current.isBefore(end.endOf("month"))) {
    days.push(current);
    current = current.add(1, "day");
  }
  return days;
};

const TimelineDateRangePicker = ({ onApply, onCancel }) => {
  const [range, setRange] = useState({ start: null, end: null });

  const handleDateClick = (day) => {
    if (!range.start || (range.start && range.end)) {
      setRange({ start: day, end: null });
    } else if (day.isBefore(range.start)) {
      setRange({ start: day, end: range.start });
    } else {
      setRange({ ...range, end: day });
    }
  };

  const isSelected = (day) => {
    if (!range.start) return false;
    if (range.start && !range.end) return day.isSame(range.start, "day");
    return day.isAfter(range.start.subtract(1, "day")) && day.isBefore(range.end.add(1, "day"));
  };

  const days = generateDays(dayjs().subtract(2, "month"), dayjs().add(1, "month"));

  return (
    <div className="p-4 w-full max-w-4xl mx-auto bg-white rounded shadow-lg">
      <div className="flex overflow-x-auto no-scrollbar space-x-2 pb-4">
        {days.map((day) => (
          <button
            key={day.format("YYYY-MM-DD")}
            onClick={() => handleDateClick(day)}
            className={clsx(
              "min-w-[60px] px-3 py-2 rounded-md border text-sm text-gray-700 transition-all",
              {
                "bg-purple-600 text-white font-semibold": isSelected(day),
                "hover:bg-gray-100": !isSelected(day),
              }
            )}
          >
            <div className="text-xs">{day.format("ddd")}</div>
            <div>{day.format("D")}</div>
          </button>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between items-center border-t pt-4 mt-4">
        <button
          onClick={() => setRange({ start: null, end: null })}
          className="text-purple-600 text-sm hover:underline"
        >
          Reset
        </button>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (range.start && range.end) {
                onApply({ start: range.start.toDate(), end: range.end.toDate() });
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineDateRangePicker;
