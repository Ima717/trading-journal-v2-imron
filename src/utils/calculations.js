import dayjs from "dayjs";

export function getPnLOverTime(trades) {
  const map = {};
  trades.forEach((trade) => {
    const time = trade.entryTime || "unknown"; // Use entryTime
    const dateKey = dayjs(time).format("YYYY-MM-DD"); // Group by day
    if (!map[dateKey]) map[dateKey] = 0;
    map[dateKey] += trade.pnl || 0;
  });
  return Object.entries(map).map(([date, pnl]) => ({ date, pnl }));
}

export function getZellaScoreOverTime(trades) {
  const map = {};

  trades.forEach((trade) => {
    const time = trade.entryTime || "unknown";
    const dateKey = dayjs(time).format("YYYY-MM-DD"); // Group by day
    if (!map[dateKey]) map[dateKey] = [];
    map[dateKey].push(trade);
  });

  return Object.entries(map).map(([date, tradesForDate]) => {
    const totalTrades = tradesForDate.length;
    const wins = tradesForDate.filter((t) => t.pnl > 0);
    const losses = tradesForDate.filter((t) => t.pnl < 0);
    const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;

    const avgWin = wins.length
      ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length
      : 0;

    const avgLoss = losses.length
      ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length)
      : 0;

    const profitFactor = losses.length
      ? wins.reduce((s, t) => s + t.pnl, 0) /
        Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
      : 0;

    const winningDays = tradesForDate.reduce(
      (acc, t) => acc + (t.pnl > 0 ? 1 : 0),
      0
    );

    const dayWinPercent = totalTrades
      ? (winningDays / totalTrades) * 100
      : 0;

    const score = Math.min(
      winRate * 0.4 + profitFactor * 10 * 0.3 + dayWinPercent * 0.3,
      100
    );

    return { date, score: parseFloat(score.toFixed(2)) };
  });
}

export function getMaxDrawdown(trades) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.entryTime) - new Date(b.entryTime) // Sort by entryTime
  );

  let peak = 0;
  let drawdown = 0;
  let cumulative = 0;

  for (let t of sorted) {
    cumulative += t.pnl || 0;
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    if (dd > drawdown) drawdown = dd;
  }

  return -drawdown.toFixed(2); // negative value (e.g. -842.50)
}

export function getRecoveryFactor(trades) {
  const netProfit = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const maxDD = Math.abs(getMaxDrawdown(trades));
  if (!maxDD || maxDD === 0) return 0;
  return parseFloat((netProfit / maxDD).toFixed(2));
}
