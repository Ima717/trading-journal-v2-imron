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
  if (type === "currency") return `$${parseFloat(value).toFixed(2)}`;
  if (type === "percent") return `${parseFloat(value).toFixed(2)}%`;
  return value;
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
