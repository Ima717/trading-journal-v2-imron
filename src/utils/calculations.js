// src/utils/calculations.js
import dayjs from "dayjs";

// Calculate cumulative P&L over time for equity curve
export const getPnLOverTime = (trades) => {
  if (!trades || trades.length === 0) return [];

  const sortedTrades = [...trades].sort((a, b) =>
    dayjs(a.date).diff(dayjs(b.date))
  );

  let cumulativePnL = 0;
  const result = sortedTrades.map((trade) => {
    cumulativePnL += trade.pnl || 0;
    return {
      date: trade.date,
      pnl: cumulativePnL,
    };
  });

  return result;
};

// Calculate Zella Score over time (simplified scoring logic)
export const getZellaScoreOverTime = (trades) => {
  if (!trades || trades.length === 0) return [];

  const sortedTrades = [...trades].sort((a, b) =>
    dayjs(a.date).diff(dayjs(b.date))
  );

  const result = [];
  let cumulativeScore = 0;
  let tradeCount = 0;

  sortedTrades.forEach((trade, index) => {
    tradeCount += 1;
    const dailyPnL = trade.pnl || 0;
    const scoreContribution = dailyPnL > 0 ? 10 : dailyPnL < 0 ? -5 : 0;
    cumulativeScore += scoreContribution;

    // Normalize score to 0-100 range
    const normalizedScore = Math.min(
      Math.max((cumulativeScore / tradeCount) + 50, 0),
      100
    );

    result.push({
      date: trade.date,
      score: normalizedScore,
    });
  });

  return result;
};

// Calculate maximum drawdown
export const getMaxDrawdown = (trades) => {
  if (!trades || trades.length === 0) return 0;

  const sortedTrades = [...trades].sort((a, b) =>
    dayjs(a.date).diff(dayjs(b.date))
  );

  let cumulativePnL = 0;
  let peak = 0;
  let maxDrawdown = 0;

  sortedTrades.forEach((trade) => {
    cumulativePnL += trade.pnl || 0;
    peak = Math.max(peak, cumulativePnL);
    const drawdown = peak - cumulativePnL;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  // Convert to percentage (assuming starting capital is peak)
  return peak > 0 ? ((maxDrawdown / peak) * 100).toFixed(2) : 0;
};

// Calculate recovery factor
export const getRecoveryFactor = (trades) => {
  if (!trades || trades.length === 0) return 0;

  const netPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const maxDrawdown = getMaxDrawdown(trades);

  return maxDrawdown > 0 ? (netPnL / maxDrawdown).toFixed(2) : 0;
};
