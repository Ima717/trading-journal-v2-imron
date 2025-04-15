// src/utils/calculations.js
import dayjs from "dayjs";

// Calculate P&L over time (cumulative)
export const getPnLOverTime = (trades) => {
  if (!trades || trades.length === 0) return [];

  const sortedTrades = [...trades].sort((a, b) =>
    dayjs(a.date).diff(dayjs(b.date))
  );

  let cumulativePnL = 0;
  return sortedTrades.map((trade) => {
    cumulativePnL += trade.pnl || 0;
    return {
      date: trade.date,
      pnl: cumulativePnL,
    };
  });
};

// Calculate Zella Score over time
export const getZellaScoreOverTime = (trades) => {
  if (!trades || trades.length === 0) return [];

  const sortedTrades = [...trades].sort((a, b) =>
    dayjs(a.date).diff(dayjs(b.date))
  );

  const result = [];
  let cumulativeScore = 0;
  let tradeCount = 0;

  sortedTrades.forEach((trade) => {
    tradeCount += 1;
    const win = trade.pnl > 0 ? 1 : 0;
    cumulativeScore += win;
    const score = (cumulativeScore / tradeCount) * 100;
    result.push({
      date: trade.date,
      score: score,
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

  let peak = 0;
  let trough = 0;
  let maxDrawdown = 0;
  let cumulativePnL = 0;

  sortedTrades.forEach((trade) => {
    cumulativePnL += trade.pnl || 0;
    peak = Math.max(peak, cumulativePnL);
    trough = Math.min(trough, cumulativePnL);
    const drawdown = peak - trough;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  return maxDrawdown > 0 ? (maxDrawdown / peak) * 100 : 0;
};

// Calculate recovery factor
export const getRecoveryFactor = (trades) => {
  if (!trades || trades.length === 0) return 0;

  const netPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const maxDrawdown = getMaxDrawdown(trades);

  return maxDrawdown > 0 ? netPnL / maxDrawdown : 0;
};
