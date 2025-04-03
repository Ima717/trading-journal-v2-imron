import React from "react";

const MiniGauge = ({ segments = [], radius = 45, strokeWidth = 8 }) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
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
      y: cy + r * Math.sin(angleInRadians),
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

  return (
    <svg
      width={radius * 2}
      height={radius + strokeWidth * 2.5}
      viewBox={`0 0 ${radius * 2} ${radius + strokeWidth * 2.5}`}
      className="block"
    >
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
