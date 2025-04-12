import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { valueAnimation, formatValue, RenderTooltip } from "../utils/statUtils.jsx";

const AvgWinLossCard = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayValue(value), 50);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="p-6 rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] max-w-[400px] h-24 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          Avg Win/Loss
          <RenderTooltip id="avg-win-loss-tooltip" content="Average win divided by average loss." />
        </div>
      </div>
      <motion.div
        {...valueAnimation}
        className="text-2xl font-bold text-gray-900 dark:text-white"
      >
        {displayValue}
      </motion.div>
    </div>
  );
};

export default AvgWinLossCard;
