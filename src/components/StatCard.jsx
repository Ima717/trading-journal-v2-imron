import React from "react";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";

const StatCard = ({ title, value, color = "text-blue-600", tooltip }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`relative bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center hover:shadow-md hover:scale-102 transition-all duration-200 ${color} overflow-hidden group`}
    data-tooltip-id={title}
    data-tooltip-content={tooltip}
  >
    {/* Subtle Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
    {/* Gradient Border on Hover */}
    <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300" />
    <h3 className="text-sm text-gray-600 relative z-10">{title}</h3>
    <p className="text-2xl font-bold mt-2 relative z-10">{value}</p>
    {tooltip && <Tooltip id={title} />}
    <style jsx>{`
      .border-gradient-to-r {
        border-image: linear-gradient(to right, #60a5fa, #a78bfa) 1;
      }
    `}</style>
  </motion.div>
);

export default StatCard;
