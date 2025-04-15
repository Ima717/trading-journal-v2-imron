




import dayjs from "dayjs";



export function getPnLOverTime(trades) {

  const sorted = [...trades].sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));

  const result = [];

  let cumulative = 0;

  const map = {};



  for (const trade of sorted) {

    const dateKey = dayjs(trade.entryTime).format("YYYY-MM-DD");

    const netPnL = (trade.pnl || 0) - (trade.commission || 0) - (trade.fees || 0);

    cumulative += netPnL;

    map[dateKey] = cumulative;

  }



  for (const [date, pnl] of Object.entries(map)) {

    result.push({ date, pnl });

  }



  return result.sort((a, b) => new Date(a.date) - new Date(b.date));

}



export function getZellaScoreOverTime(trades, windowDays = 7) {

  const sortedTrades = [...trades].sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));

  const result = [];



  for (let i = 0; i < sortedTrades.length; i++) {

    const currentTrade = sortedTrades[i];

    const currentDate = dayjs(currentTrade.entryTime).format("YYYY-MM-DD");

    const startDate = dayjs(currentDate).subtract(windowDays, "day");



    // Get trades within the window

    const windowTrades = sortedTrades.filter((trade) => {

      const tradeDate = dayjs(trade.entryTime);

      return tradeDate.isAfter(startDate) && tradeDate.isBefore(dayjs(currentDate).add(1, "day"));

    });



    // Calculate metrics for the window

    const totalTrades = windowTrades.length;

    const wins = windowTrades.filter((t) => t.pnl > 0);

    const losses = windowTrades.filter((t) => t.pnl < 0);

    const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;



    const avgWin = wins.length

      ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length

      : 0;

    const avgLoss = losses.length

      ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length)

      : 0;

    const avgWinLoss = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? 100 : 0);

    const normalizedAvgWinLoss = Math.min(avgWinLoss * 10, 100);



    const profitFactor = losses.length

      ? wins.reduce((s, t) => s + t.pnl, 0) /

        Math.abs(losses.reduce((s, t) => s + t.pnl, 0))

      : (wins.length ? 100 : 0);

    const normalizedProfitFactor = Math.min(profitFactor * 10, 100);



    let peak = 0, trough = 0, maxDD = 0, cumulative = 0;

    for (const trade of windowTrades) {

      cumulative += trade.pnl || 0;

      peak = Math.max(peak, cumulative);

      trough = Math.min(cumulative, peak);

      const dd = peak > 0 ? (peak - trough) / peak * 100 : 0;

      maxDD = Math.max(maxDD, dd);

    }

    const normalizedMaxDD = Math.max(0, 100 - maxDD);



    const dailyPnL = windowTrades.map(t => t.pnl || 0);

    const meanPnL = dailyPnL.length ? dailyPnL.reduce((s, v) => s + v, 0) / dailyPnL.length : 0;

    const variance = dailyPnL.length

      ? dailyPnL.reduce((s, v) => s + Math.pow(v - meanPnL, 2), 0) / dailyPnL.length

      : 0;

    const stdDev = Math.sqrt(variance);

    const normalizedConsistency = stdDev > 0 ? Math.max(0, 100 - stdDev / meanPnL * 100) : 100;



    const avgRisk = windowTrades.length

      ? windowTrades.reduce((s, t) => s + (t.amount || 0), 0) / windowTrades.length

      : 0;

    const normalizedRisk = avgRisk > 0 ? Math.max(0, 100 - avgRisk / 1000 * 100) : 100;



    const score = Math.min(

      winRate * 0.2 +

      normalizedAvgWinLoss * 0.2 +

      normalizedProfitFactor * 0.2 +

      normalizedMaxDD * 0.15 +

      normalizedConsistency * 0.15 +

      normalizedRisk * 0.1,

      100

    );



    result.push({ date: currentDate, score: parseFloat(score.toFixed(2)) });

  }



  return result;

}



export function getMaxDrawdown(trades) {

  const sorted = [...trades].sort(

    (a, b) => new Date(a.entryTime) - new Date(b.entryTime)

  );



  let peak = 0;

  let maxDD = 0;

  let cumulative = 0;



  for (const t of sorted) {

    const netPnL = (t.pnl || 0) - (t.commission || 0) - (t.fees || 0);

    cumulative += netPnL;

    peak = Math.max(peak, cumulative);

    const dd = peak > 0 ? (peak - cumulative) / peak * 100 : 0;

    maxDD = Math.max(maxDD, dd);

  }



  return -parseFloat(maxDD.toFixed(2)); // As a negative percentage

}



export function getRecoveryFactor(trades) {

  const netProfit = trades.reduce((acc, t) => acc + (t.pnl || 0) - (t.commission || 0) - (t.fees || 0), 0);

  const maxDDPercent = Math.abs(getMaxDrawdown(trades)); // Percentage

  const maxDDValue = maxDDPercent > 0 ? (netProfit / 100) * maxDDPercent : 0; // Convert percentage to dollar value

  if (!maxDDValue || maxDDValue === 0) return 0;

  return parseFloat((netProfit / maxDDValue).toFixed(2));

}
