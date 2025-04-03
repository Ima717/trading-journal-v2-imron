import React from "react";

const MiniGauge = ({ segments = [], radius = 35, strokeWidth = 5 }) => {
  // Calculate total value to normalize segments
  const total = segments.reduce((sum, seg) => sum + (seg.value || 0), 0) || 1; // Avoid division by zero
  const normalizedSegments = segments.map((seg) => ({
    ...seg,
    percent: (seg.value / total) * 100 || 0, // Ensure percent is defined
  }));

  // SVG geometry calculations
  const cx = radius; // Center x of the circle
  const cy = radius; // Center y of the circle
  const r = radius - strokeWidth / 2; // Radius adjusted for stroke width

  // Convert polar coordinates to Cartesian for arc drawing
  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180; // Start from top
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  // Generate the SVG path for an arc
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

  // SVG dimensions
  const diameter = radius * 2;
  const gaugeHeight = radius + strokeWidth; // Height to fit the semi-circle

  return (
    <div className="flex justify-center items-center w-full h-full">
      <svg
        width={diameter}
        height={gaugeHeight}
        viewBox={`0 0 ${diameter} ${gaugeHeight}`}
        className="block"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          transform: "translateY(-5%)", // Fine-tune vertical centering
        }}
      >
        {/* Background circle for contrast */}
        <path
          d={describeArc(0, 180)}
          fill="none"
          stroke="#e5e7eb" // Light gray background
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Render each segment */}
        {normalizedSegments.map((seg, index) => {
          const arcLength = (seg.percent / 100) * 180;
          const endAngle = startAngle + arcLength;
          const d = describeArc(startAngle, endAngle);

          const path = (
            <path
              key={index}
              d={d}
              fill="none"
              stroke={seg.color || "#000"} // Default to black if no color
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
          startAngle = endAngle;
          return path;
        })}
      </svg>
    </div>
  );
};

export default MiniGauge;
