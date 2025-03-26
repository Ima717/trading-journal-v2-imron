import React from "react";
import { useFilters } from "../context/FilterContext";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Win", value: "win" },
  { label: "Loss", value: "loss" },
  { label: "Breakeven", value: "breakeven" },
];

const ResultFilter = () => {
  const { resultFilter, setResultFilter } = useFilters();

  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {filterOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setResultFilter(opt.value)}
          className={`px-3 py-1 text-sm rounded-full border transition font-medium ${
            resultFilter === opt.value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default ResultFilter;
