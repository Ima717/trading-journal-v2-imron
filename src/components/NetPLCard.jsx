import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { valueAnimation, formatValue, RenderTooltip } from "../utils/statUtils";

const NetPLCard = ({ value, badge, trades }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayValue(value), 50);
    return () => clearTimeout(timeout);
  }, [value]);

  const color = value >= 0 ? "text-green-600" : "text-red-500";

  return (
    <div className="p-6 rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[200px] max-w-[300px] h-24 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          Net P&L
          <RenderTooltip id="net-pl-tooltip" content="Total net profit/loss across all trades." />
        </div>
        {badge !== undefined && (
          <span className="text-xs bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 px-2 py-0.5 rounded-full font-semibold">
            {badge}
          </span>
        )}
      </div>
      <motion.div
        {...valueAnimation}
        className={`text-2xl font-bold ${color}`}
      >
        {formatValue(displayValue, "currency")}
      </motion.div>
    </div>
  );
};

export default NetPLCard;
