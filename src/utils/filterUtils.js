// utils/filterUtils.js

export function filterTradesByDate(trades, dateRange) {
  if (!dateRange.start || !dateRange.end) return trades;

  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);

  return trades.filter((trade) => {
    const tradeDate = new Date(trade.date);
    return tradeDate >= start && tradeDate <= end;
  });
}
