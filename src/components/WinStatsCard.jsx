// WinStatsCard.jsx
import React from "react";
import { useFilters } from "../context/FilterContext";
import StatCard from "./StatCard";
import MiniGauge from "./MiniGauge";
import { motion } from "framer-motion";

const WinStatsCard = () => {
  const { filteredTrades } = useFilters();

  // --- DAY WIN % LOGIC ---
  const uniqueDays = [...new Set(filteredTrades.map((t) => t.date))];
  const stats = uniqueDays.reduce(
    (acc, date) => {
      const trades = filteredTrades.filter((t) => t.date === date);
      const pnl = trades.reduce((sum, t) => sum + t.pnl, 0);
      if (pnl > 0) acc.green++;
      else if (pnl === 0) acc.blue++;
      else acc.red++;
      return acc;
    },
    { green: 0, blue: 0, red: 0 }
  );

  const totalDays = stats.green + stats.blue + stats.red;
  const dayWinPercent = totalDays ? (stats.green / totalDays) * 100 : 0;

  // --- AVG WIN/LOSS LOGIC ---
  const winningTrades = filteredTrades.filter((t) => t.pnl > 0);
  const losingTrades = filteredTrades.filter((t) => t.pnl < 0);

  const avgWin = winningTrades.length
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
    : 0;

  const avgLoss = losingTrades.length
    ? Math.abs(
        losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length
      )
    : 0;

  const ratio = avgLoss ? avgWin / avgLoss : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Day Win % Card */}
      <StatCard
        title="Day Win %"
        tooltip="Percentage of trading days that ended with net profit."
      >
        <div className="flex flex-col items-center justify-center h-full mt-2">
          <MiniGauge
            segments={[
              { value: stats.green, color: "#22c55e" }, // Green for winning days
              { value: stats.red, color: "#ef4444" },   // Red for losing days
            ]}
            size={80}
          />
          <motion.div
            key={dayWinPercent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mt-2"
          >
            {`${dayWinPercent.toFixed(2)}%`}
          </motion.div>
        </div>
      </StatCard>

      {/* Avg Win/Loss Card */}
      <StatCard
        title="Avg win/loss trade"
        tooltip="Average dollar value of winning vs losing trades."
      >
        <div className="flex flex-col items-center justify-center h-full mt-2">
          <MiniGauge
            segments={[
              { value: avgWin, color: "#22c55e" },  // Green for avg win
              { value: avgLoss, color: "#ef4444" }, // Red for avg loss
            ]}
            size={80}
          />
          <motion.div
            key={ratio}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mt-2"
          >
            {ratio.toFixed(2)}
          </motion.div>
        </div>
      </StatCard>
    </div>
  );
};

export default WinStatsCard;
