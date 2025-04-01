// calculations.js – Trade analysis utils

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
  const groupedByDate = {};

  trades.forEach((trade) => {
    if (!trade.date || typeof trade.pnl !== "number") return;
    if (!groupedByDate[trade.date]) groupedByDate[trade.date] = [];
    groupedByDate[trade.date].push(trade);
  });

  const result = Object.entries(groupedByDate).map(([date, trades]) => {
    const total = trades.length;
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const winRate = total ? (wins.length / total) * 100 : 0;
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
    const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    const zellaScore = Math.min(
      (winRate * 0.4 + profitFactor * 10 * 0.3 + winRate * 0.3),
      100
    );

    return {
      date,
      zellaScore: parseFloat(zellaScore.toFixed(2)),
    };
  });

  return result.sort((a, b) => new Date(a.date) - new Date(b.date));
}
