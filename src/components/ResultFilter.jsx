import React from "react";
import { useFilters } from "../context/FilterContext";

const ResultFilter = () => {
  const { resultFilter, setResultFilter } = useFilters();

  const filters = ["all", "Win", "Loss", "Break-even"];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setResultFilter(filter)}
          className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 ${
            resultFilter === filter
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default ResultFilter;
