import React from "react";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";

const StatCard = ({ title, value, color = "text-blue-600", tooltip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md w-full flex flex-col justify-center items-center hover:shadow-xl hover:scale-[1.05] transition-all duration-200 ${color} overflow-hidden group`}
      data-tooltip-id={title}
      data-tooltip-content={tooltip}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all duration-300" />

      {/* Title & Value */}
      <h3 className="text-sm text-gray-600 dark:text-gray-300 relative z-10 font-semibold">{title}</h3>
      <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white relative z-10">{value}</p>

      {/* Tooltip if provided */}
      {tooltip && <Tooltip id={title} />}

      {/* Custom gradient border class */}
      <style jsx>{`
        .border-gradient-to-r {
          border-image: linear-gradient(to right, #60a5fa, #a78bfa) 1;
        }
      `}</style>
    </motion.div>
  );
};

export default StatCard;
