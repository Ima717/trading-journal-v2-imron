import React from "react";
import StatCard from "./StatCard";

const WinStatsCard = ({ dayWinPercent, avgWinLossTrade }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Day Win % Card */}
      <StatCard
        title="Day Win %"
        value={`${dayWinPercent}%`}
        tooltip="Percentage of trading days that ended with net profit."
      />

      {/* Avg Win/Loss Card */}
      <StatCard
        title="Avg Win/Loss Trade"
        value={avgWinLossTrade}
        tooltip="Average dollar value of winning vs losing trades."
      />
    </div>
  );
};

export default WinStatsCard;
