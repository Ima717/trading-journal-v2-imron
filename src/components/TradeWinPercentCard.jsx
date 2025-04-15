// src/components/TradeWinPercentCard.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { valueAnimation, formatValue, RenderTooltip } from "../utils/statUtils.jsx";

const TradeWinPercentCard = ({ value, customBg }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayValue(value), 50);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className={`p-6 rounded-xl shadow-sm min-w-[200px] flex-1 h-24 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200 ${customBg}`}>
 Parr      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          Trade Win %
          <RenderTooltip id="trade-win-tooltip" content="Winning trades vs total trades." />
        </div>
      </div>
      <motion.div
        {...valueAnimation}
        className="text-2xl font-bold text-white"
      >
        {formatValue(displayValue, "percent")}
      </motion.div>
    </div>
  );
};

export default TradeWinPercentCard;
