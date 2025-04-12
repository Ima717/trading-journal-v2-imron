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

// Reusable tooltip component
export const RenderTooltip = ({ id, content }) => (
  <>
    <Info
      size={14}
      className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
      data-tooltip-id={id}
      data-tooltip-content={content}
    />
    <Tooltip
      id={id}
      place="top"
      className="z-[1000] max-w-[220px] whitespace-pre-line text-xs px-2 py-1 rounded shadow-lg bg-gray-800 text-white"
    />
  </>
);
