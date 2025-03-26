export function getPnLOverTime(trades) {
  const map = {};

  trades.forEach((trade) => {
    const date = trade.date || "unknown";
    if (!map[date]) map[date] = 0;
    map[date] += trade.pnl || 0;
  });

  return Object.entries(map).map(([date, pnl]) => ({ date, pnl }));
}
