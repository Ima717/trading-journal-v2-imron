import React from "react";

const MiniGauge = ({ segments = [], radius = 40, strokeWidth = 10 }) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const normalizedSegments = segments.map((seg) => ({
    ...seg,
    percent: (seg.value / total) * 100,
  }));

  const cx = radius;
  const cy = radius;
  const r = radius - strokeWidth / 2;
  const circumference = Math.PI * r;

  let startAngle = -90;

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = (Math.PI / 180) * angleInDegrees;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
    ].join(" ");
  };

  return (
    <svg width={radius * 2} height={radius + strokeWidth} viewBox={`0 0 ${radius * 2} ${radius + strokeWidth}`}>
      {normalizedSegments.map((seg, index) => {
        const arcLength = (seg.percent / 100) * 180;
        const endAngle = startAngle + arcLength;
        const path = describeArc(startAngle, endAngle);
        startAngle = endAngle;

        return (
          <path
            key={index}
            d={path}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

export default MiniGauge;
