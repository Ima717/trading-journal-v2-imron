import React from "react";

const MiniGauge = ({ segments = [], radius = 40, strokeWidth = 6 }) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1; // Avoid division by zero
  const normalizedSegments = segments.map((seg) => ({
    ...seg,
    percent: (seg.value / total) * 100,
  }));

  const cx = radius;
  const cy = radius;
  const r = radius - strokeWidth / 2;

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin

(angleInRadians),
    };
  };

  const describeArc = (startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 1, end.x, end.y,
    ].join(" ");
  };

  let startAngle = 0;

  // Define SVG dimensions
  const svgWidth = radius * 2;
  const svgHeight = radius + strokeWidth; // Ensure enough height for the semi-circle

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="block mx-auto"
    >
      {/* Optional: Add a background circle for better visual contrast */}
      <path
        d={describeArc(0, 180)}
        fill="none"
        stroke="#e5e7eb" // Light gray background
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Render the segments */}
      {normalizedSegments.map((seg, index) => {
        const arcLength = (seg.percent / 100) * 180;
        const endAngle = startAngle + arcLength;
        const d = describeArc(startAngle, endAngle);
        const path = (
          <path
            key={index}
            d={d}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
        startAngle = endAngle;
        return path;
      })}
    </svg>
  );
};

export default MiniGauge;
