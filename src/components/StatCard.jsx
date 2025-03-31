import React from "react";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";

const StatCard = ({ title, value, color = "text-blue-600", tooltip }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white p-6 rounded-lg shadow-sm w-full flex flex-col justify-center items-center hover:shadow-md hover:scale-102 transition-all duration-200 ${color}`}
    data-tooltip-id={title}
    data-tooltip-content={tooltip}
  >
    <h3 className="text-sm text-gray-600">{title}</h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
    {tooltip && <Tooltip id={title} />}
  </motion.div>
);

export default StatCard;
