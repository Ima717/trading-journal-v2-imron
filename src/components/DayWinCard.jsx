// src/components/DayWinCard.jsx
import React from "react";
import { Tooltip } from "react-tooltip";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const DayWinCard = ({ winningDays, breakEvenDays, losingDays, totalDays }) => {
  const winPercent = totalDays ? (winningDays / totalDays) * 100 : 0;
  const breakEvenPercent = totalDays ? (breakEvenDays / totalDays) * 100 : 0;
  const losePercent = totalDays ? (losingDays / totalDays) * 100 : 0;

  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-zinc-800">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Day Win %</h3>
        <span
          data-tooltip-id="day-win-tooltip"
          data-tooltip-html={`<div>Winning Days: ${winningDays}<br/>Break Even Days: ${breakEvenDays}<br/>Losing Days: ${losingDays}</div>`}
          className="cursor-help text-gray-500 dark:text-gray-400"
        >
          ⓘ
        </span>
        <Tooltip id="day-win-tooltip" place="top" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="w-24 h-12 relative">
          <CircularProgressbar
            value={winPercent}
            maxValue={100}
            text={`${winPercent.toFixed(2)}%`}
            styles={buildStyles({
              pathColor: "#10b981",
              trailColor: "#d1d5db",
              textColor: "#1f2937",
              textSize: "20px",
              rotation: 0.5,
              strokeLinecap: "butt",
            })}
            strokeWidth={10}
          />
          <div className="absolute top-0 left-0 w-full h-full">
            <CircularProgressbar
              value={breakEvenPercent}
              maxValue={100}
              styles={buildStyles({
                pathColor: "#facc15",
                trailColor: "transparent",
                rotation: 0.5,
                strokeLinecap: "butt",
              })}
              strokeWidth={10}
            />
          </div>
          <div className="absolute top-0 left-0 w-full h-full">
            <CircularProgressbar
              value={losePercent}
              maxValue={100}
              styles={buildStyles({
                pathColor: "#ef4444",
                trailColor: "transparent",
                rotation: 0.5,
                strokeLinecap: "butt",
              })}
              strokeWidth={10}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="text-center">
            <p className="text-sm text-green-500">{winningDays}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-yellow-500">{breakEvenDays}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-red-500">{losingDays}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayWinCard;
