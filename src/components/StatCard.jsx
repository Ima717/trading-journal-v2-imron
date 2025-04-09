import React, { useEffect, useState, useRef } from "react";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";
import { Info, BarChart3 } from "lucide-react";

const GaugeBar = ({ 
  value, 
  maxValue = 100, 
  height = 4, 
  animate = true,
  colorScheme = "default" // Options: default, success, warning, danger, neutral
}) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const containerRef = useRef(null);
  
  // Color schemes for different types of gauges
  const colorSchemes = {
    default: "bg-gradient-to-r from-blue-500 to-purple-600",
    success: "bg-gradient-to-r from-green-400 to-emerald-500",
    warning: "bg-gradient-to-r from-yellow-300 to-amber-500",
    danger: "bg-gradient-to-r from-red-400 to-rose-600",
    neutral: "bg-gradient-to-r from-gray-400 to-gray-600",
    profit: "bg-gradient-to-r from-emerald-400 to-green-600",
    loss: "bg-gradient-to-r from-rose-400 to-red-500",
    performance: "bg-gradient-to-r from-blue-400 via-violet-500 to-purple-600"
  };
  
  const selectedColorScheme = colorSchemes[colorScheme] || colorSchemes.default;

  return (
    <div className="w-full mt-2">
      <div 
        ref={containerRef}
        className={`w-full h-${height} rounded-full bg-gray-100 dark:bg-zinc-700 overflow-hidden`}
      >
        <motion.div
          className={`h-full rounded-full ${selectedColorScheme}`}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animate ? 0.6 : 0, 
            ease: [0.34, 1.56, 0.64, 1]
          }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-400 dark:text-gray-500">
        <span>0</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
};

// Circular Gauge for more visual appeal on special metrics
const CircularGauge = ({ 
  value, 
  maxValue = 100, 
  size = 42, 
  strokeWidth = 4,
  colorScheme = "default"
}) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Color mapping for circular gauges
  const colorMap = {
    default: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    neutral: "#6b7280",
    profit: "#059669",
    loss: "#e11d48",
    performance: "#7c3aed"
  };
  
  const gaugeColor = colorMap[colorScheme] || colorMap.default;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(209, 213, 219, 0.3)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium" style={{ color: gaugeColor }}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  color = "text-gray-900 dark:text-white",
  tooltip,
  badge,
  customBg = "",
  gaugeValue,
  gaugeMax = 100,
  gaugeType = "horizontal", // horizontal, circular, or none
  gaugeColor = "default",
  children,
}) => {
  const tooltipId = `tooltip-${title}`;
  const badgeId = `badge-${title}`;
  const [displayValue, setDisplayValue] = useState(value);
  
  // Calculate optimal gauge color based on value type
  const determineGaugeColor = () => {
    if (gaugeColor !== "default") return gaugeColor;
    
    // If value appears to be a percentage
    if (typeof gaugeValue === 'number') {
      if (title.toLowerCase().includes('win') || 
          title.toLowerCase().includes('profit') || 
          title.toLowerCase().includes('gain')) {
        return gaugeValue >= 60 ? "success" : gaugeValue >= 40 ? "warning" : "danger";
      }
      
      if (title.toLowerCase().includes('loss') || 
          title.toLowerCase().includes('drawdown') || 
          title.toLowerCase().includes('risk')) {
        return gaugeValue <= 30 ? "success" : gaugeValue <= 60 ? "warning" : "danger";
      }
    }
    
    return "default";
  };
  
  const effectiveGaugeColor = determineGaugeColor();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayValue(value);
    }, 50);
    return () => clearTimeout(timeout);
  }, [value]);
  
  return (
    <div
      className={`relative p-6 rounded-xl shadow-sm w-full flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200 group overflow-hidden ${
        customBg || "bg-white dark:bg-zinc-800"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          {title}
          {tooltip && (
            <>
              <Info
                size={14}
                className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                data-tooltip-id={tooltipId}
                data-tooltip-content={tooltip}
              />
              <Tooltip
                id={tooltipId}
                place="top"
                className="z-[1000] max-w-[220px] whitespace-pre-line text-xs px-2 py-1 rounded shadow-lg bg-gray-800 text-white"
              />
            </>
          )}
        </div>
        {badge !== undefined && title !== "Total Trades" && (
          <>
            <span
              className="text-xs bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 px-2 py-0.5 rounded-full font-semibold cursor-default"
              data-tooltip-id={badgeId}
              data-tooltip-content="Total number of trades"
            >
              {badge}
            </span>
            <Tooltip
              id={badgeId}
              place="top"
              className="z-50 text-xs px-2 py-1 rounded shadow-lg bg-gray-900 text-white"
            />
          </>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between">
          <motion.div
            key={displayValue}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-2xl font-bold ${color}`}
          >
            {displayValue}
          </motion.div>
          
          {gaugeType === 'circular' && gaugeValue !== undefined && (
            <CircularGauge 
              value={gaugeValue} 
              maxValue={gaugeMax} 
              colorScheme={effectiveGaugeColor}
            />
          )}
          
          {children && (
            <div className="w-10 h-10">{children}</div>
          )}
        </div>
        
        {/* Gauge Bar */}
        {gaugeType === 'horizontal' && gaugeValue !== undefined && (
          <GaugeBar 
            value={gaugeValue} 
            maxValue={gaugeMax} 
            colorScheme={effectiveGaugeColor}
          />
        )}
      </div>
      
      {/* Hover Icon */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-md p-1">
          <BarChart3 size={14} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
