// MiniGauge.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MiniGauge = ({ segments = [], size = 100 }) => {
  const radius = size / 2;
  const strokeWidth = size / 10;
  const circumference = Math.PI * radius; // Semi-circle circumference

  // Calculate total value from segments
  const total = segments.reduce((sum, seg) => sum + (seg.value || 0), 0) || 1; // Avoid division by zero

  // Generate paths for each segment with animation
  let startAngle = 0;
  const segmentPaths = segments.map((seg, index) => {
    const segPercent = (seg.value / total) * 100;
    const arcLength = (segPercent / 100) * 180; // 180 degrees for semi-circle
    const endAngle = startAngle + arcLength;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const startX = radius + (radius - strokeWidth / 2) * Math.cos(startRad);
    const startY = radius + (radius - strokeWidth / 2) * Math.sin(startRad);
    const endX = radius + (radius - strokeWidth / 2) * Math.cos(endRad);
    const endY = radius + (radius - strokeWidth / 2) * Math.sin(endRad);

    const largeArcFlag = arcLength > 90 ? 1 : 0;

    const pathD = [
      `M ${startX} ${startY}`,
      `A ${radius - strokeWidth / 2} ${radius - strokeWidth / 2} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    ].join(" ");

    startAngle = endAngle;

    return (
      <motion.path
        key={index}
        d={pathD}
        fill="none"
        stroke={seg.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }} // Smooth 1.5-second animation
      />
    );
  });

  return (
    <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
      {/* Background trail */}
      <path
        d={`M ${strokeWidth} ${radius} A ${radius - strokeWidth} ${
          radius - strokeWidth
        } 0 0 1 ${size - strokeWidth} ${radius}`}
        fill="none"
        stroke="#e5e7eb" // Light mode: gray-200
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="dark:stroke-gray-700" // Dark mode: gray-700
      />
      {/* Animated gauge segments */}
      {segmentPaths}
    </svg>
  );
};

export default MiniGauge;
