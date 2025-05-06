// src/utils/statUtils.jsx
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

// Animation variant for value display
export const valueAnimation = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

// Format numbers (currency, percentage, or raw)
export const formatValue = (value, type) => {
  const numericValue = parseFloat(value); // Attempt to parse

  // Check if the parsed value is a valid number
  if (isNaN(numericValue)) {
    // If not a number, return a placeholder based on type
    if (type === "currency") return "$--.--";
    if (type === "percent") return "--.--%";
    // For other types, or if no specific placeholder, you might return "N/A" or an empty string
    return "N/A";
  }

  // If it's a valid number, proceed with formatting
  if (type === "currency") return `$${numericValue.toFixed(2)}`;
  if (type === "percent") return `${numericValue.toFixed(2)}%`;
  return numericValue.toString(); // Return the number as a string if no other type matches
};

// Format P&L values (handles k notation for large numbers)
export const formatPnL = (value) => {
  const numericValue = parseFloat(value); // Attempt to parse the input value

  // Check if the parsed value is a valid number
  if (isNaN(numericValue)) {
    console.warn("formatPnL received non-numeric or unparseable value:", value);
    return "+$0.00"; // Or return "N/A", or some other suitable placeholder
  }

  // Now we know numericValue is a valid number, so Math.abs will also work correctly
  const absValue = Math.abs(numericValue);

  if (absValue >= 1000) {
    const kValue = (absValue / 1000).toFixed(1);
    return `${numericValue >= 0 ? "+" : "-"}$${kValue.endsWith(".0") ? kValue.slice(0, -2) : kValue}k`;
  }
  if (Number.isInteger(absValue)) { // This check is fine as absValue is now guaranteed numeric
    return `${numericValue >= 0 ? "+" : "-"}$${absValue.toFixed(0)}`;
  }
  return `${numericValue >= 0 ? "+" : "-"}$${absValue.toFixed(1)}`;
};

// Reusable tooltip component with dynamic content
export const RenderTooltip = ({ id, content }) => {
  // Default content based on id
  let tooltipContent = content;
  if (id === "avg-win-loss-tooltip") {
    tooltipContent = "The average profit on all winning and losing trades.";
  } else if (id === "day-win-tooltip") {
    tooltipContent = "Percentage of trading days with positive P&L.";
  } else if (id === "profit-factor-tooltip") {
    tooltipContent = "Gross profit / gross loss.";
  } else if (id === "trade-win-tooltip") {
    tooltipContent = "Winning trades vs total trades.";
  } else if (id === "net-pl-tooltip") {
    tooltipContent = "Total net profit/loss across all trades.";
  }

  return (
    <>
      <Info
        size={14}
        className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
        data-tooltip-id={id}
        data-tooltip-content={tooltipContent}
      />
      <Tooltip
        id={id}
        place="top"
        className="z-[1000] max-w-[220px] whitespace-pre-line bg-white dark:bg-zinc-800 rounded-xl shadow-sm px-4 py-2 text-gray-900 dark:text-gray-100 text-xs font-medium"
      />
    </>
  );
};
