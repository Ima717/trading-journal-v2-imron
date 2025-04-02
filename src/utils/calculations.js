export function getPnLOverTime(trades) {
  const map = {};
  trades.forEach((trade) => {
    const date = trade.date || "unknown";
    if (!map[date]) map[date] = 0;
    map[date] += trade.pnl || 0;
  });
  return Object.entries(map).map(([date, pnl]) => ({ date, pnl }));
}

export function getZellaScoreOverTime(trades) {
  const map = {};

  trades.forEach((trade) => {
    const date = trade.date || "unknown";
    if (!map[date]) map[date] = [];
    map[date].push(trade);
  });

  return Object.entries(map).map(([date, tradesForDate]) => {
    const totalTrades = tradesForDate.length;
    const wins = tradesForDate.filter((t) => t.pnl > 0);
    const losses = tradesForDate.filter((t) => t.pnl < 0);
    const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
    const profitFactor = losses.length ? wins.reduce((s, t) => s + t.pnl, 0) / Math.abs(losses.reduce((s, t) => s + t.pnl, 0)) : 0;
    const winningDays = tradesForDate.reduce((acc, t) => acc + (t.pnl > 0 ? 1 : 0), 0);
    const dayWinPercent = totalTrades ? (winningDays / totalTrades) * 100 : 0;

    const score = Math.min((winRate * 0.4 + profitFactor * 10 * 0.3 + dayWinPercent * 0.3), 100);

    return { date, score: parseFloat(score.toFixed(2)) };
  });
}
