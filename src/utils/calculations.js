import dayjs from "dayjs";

/**
 * Calculates cumulative P&L over time, grouped by day.
 * @param {Array} trades - Array of trade objects.
 * @returns {Array} - Array of { date: string, pnl: number } objects.
 */
export function getPnLOverTime(trades) {
  if (!trades || trades.length === 0) return [];

  const sorted = [...trades].sort(
    (a, b) => new Date(a.entryTime) - new Date(b.entryTime)
  );
  const result = [];
  let cumulative = 0;
  const map = {}; // Use map to store latest cumulative PnL for each day

  for (const trade of sorted) {
    // Ensure entryTime is valid before processing
    if (trade.entryTime && dayjs(trade.entryTime).isValid()) {
      const dateKey = dayjs(trade.entryTime).format("YYYY-MM-DD");
      // Ensure pnl is a number, default to 0 if not
      const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
      const commission = typeof trade.commission === 'number' ? trade.commission : 0;
      const fees = typeof trade.fees === 'number' ? trade.fees : 0;

      const netPnL = pnl - commission - fees;
      cumulative += netPnL;
      map[dateKey] = cumulative; // Update the map with the latest cumulative PnL for the day
    }
  }

  // Convert map to array format for charts
  for (const [date, pnl] of Object.entries(map)) {
    result.push({ date, pnl: parseFloat(pnl.toFixed(2)) });
  }

  // Sort the final result by date
  return result.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Calculates a custom "Zella Score" using a rolling window.
 * NOTE: Current implementation has O(n*m) complexity and may be slow for large datasets.
 * Consider optimizing with a sliding window algorithm if performance is an issue.
 * @param {Array} trades - Array of trade objects.
 * @param {number} [windowDays=7] - The rolling window size in days.
 * @returns {Array} - Array of { date: string, score: number } objects.
 */
export function getZellaScoreOverTime(trades, windowDays = 7) {
  if (!trades || trades.length === 0) return [];

  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.entryTime) - new Date(b.entryTime)
  );
  const result = [];
  const dailyScores = {}; // Store latest score for each day

  for (let i = 0; i < sortedTrades.length; i++) {
    const currentTrade = sortedTrades[i];
    if (!currentTrade.entryTime || !dayjs(currentTrade.entryTime).isValid()) continue; // Skip invalid trades

    const currentDate = dayjs(currentTrade.entryTime);
    const currentDateKey = currentDate.format("YYYY-MM-DD");
    const startDate = currentDate.subtract(windowDays, "day");

    // Get trades within the window ending on the current trade's date
    const windowTrades = sortedTrades.filter((trade) => {
       if (!trade.entryTime || !dayjs(trade.entryTime).isValid()) return false;
      const tradeDate = dayjs(trade.entryTime);
      // Include trades from the start date up to the end of the current date
      return !tradeDate.isBefore(startDate) && !tradeDate.isAfter(currentDate);
    });

    if (windowTrades.length === 0) continue;

    // --- Calculate metrics for the window ---
    const totalTrades = windowTrades.length;
    const wins = windowTrades.filter((t) => t.pnl > 0);
    const losses = windowTrades.filter((t) => t.pnl < 0);

    // Metric 1: Win Rate (Weight: 0.2)
    const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;

    // Metric 2: Avg Win / Avg Loss Ratio (Weight: 0.2)
    const grossProfit = wins.reduce((s, t) => s + (t.pnl || 0), 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0));
    const avgWin = wins.length ? grossProfit / wins.length : 0;
    const avgLoss = losses.length ? grossLoss / losses.length : 0;
    // Calculate ratio, handle division by zero. Max value conceptually capped later.
    const avgWinLossRatio = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? Infinity : 0);
    // Normalize: Scale ratio, capping at 100. Assumes ratio*10 is a reasonable scale.
    const normalizedAvgWinLoss = Math.min(avgWinLossRatio * 10, 100);

    // Metric 3: Profit Factor (Weight: 0.2)
    // Calculate factor, handle division by zero. Max value conceptually capped later.
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);
     // Normalize: Scale factor, capping at 100. Assumes factor*10 is a reasonable scale.
    const normalizedProfitFactor = Math.min(profitFactor * 10, 100);

    // Metric 4: Max Drawdown (Value) in Window (Weight: 0.15)
    let peakEquity = 0, maxDDValue = 0, cumulativeEquity = 0;
    for (const trade of windowTrades) {
      cumulativeEquity += (trade.pnl || 0);
      peakEquity = Math.max(peakEquity, cumulativeEquity);
      const currentDDValue = peakEquity - cumulativeEquity; // Drawdown in currency
      maxDDValue = Math.max(maxDDValue, currentDDValue);
    }
    // Normalize: Inverse relationship - lower drawdown is better. Capped at 100.
    // Simple normalization: (1 - DD/ReasonableMaxDD)*100. Needs a 'ReasonableMaxDD' estimate.
    // Alternative simpler normalization for score: Higher score for lower DD. Max score 100.
    // Example: If maxDDValue is 0, score is 100. If maxDDValue is large, score approaches 0.
    // Needs a scaling factor based on typical account/trade size. Let's use a placeholder logic.
    // This normalization needs refinement based on expected DD values.
    const normalizedMaxDD = Math.max(0, 100 - (maxDDValue / (cumulativeEquity || 1)) * 100); // Placeholder: DD as % of final equity

    // Metric 5: Consistency (Std Dev of PnL) (Weight: 0.15)
    const dailyPnL = windowTrades.map(t => t.pnl || 0);
    const meanPnL = totalTrades ? dailyPnL.reduce((s, v) => s + v, 0) / totalTrades : 0;
    const variance = totalTrades
      ? dailyPnL.reduce((s, v) => s + Math.pow(v - meanPnL, 2), 0) / totalTrades
      : 0;
    const stdDev = Math.sqrt(variance);
    // Normalize: Lower std dev relative to mean is better.
    // Avoid division by zero if meanPnL is 0. Coefficient of Variation = stdDev / |meanPnL|
    const coeffVar = meanPnL !== 0 ? stdDev / Math.abs(meanPnL) : (stdDev > 0 ? Infinity : 0);
    // Normalize: Inverse relationship. Lower coeffVar = higher score. Capped at 100.
    const normalizedConsistency = Math.max(0, 100 - coeffVar * 100); // Simple normalization, scale factor 100 arbitrary

    // Metric 6: Risk (Avg Trade Size) (Weight: 0.1) - Needs better definition of 'risk'
    // Using average 'amount' field as a proxy for risk exposure per trade.
    const totalAmount = windowTrades.reduce((s, t) => s + (t.amount || 0), 0);
    const avgAmount = totalTrades ? totalAmount / totalTrades : 0;
    // Normalize: Assuming lower average amount indicates lower risk. Needs scaling factor.
    // Example: Score decreases as avgAmount increases. Max score 100.
    // This normalization needs refinement based on typical trade sizes.
    const normalizedRisk = Math.max(0, 100 - (avgAmount / 1000) * 100); // Placeholder: assumes 1000 is a significant avg amount

    // Calculate final weighted score
    const score = Math.min(
      winRate * 0.2 +
      normalizedAvgWinLoss * 0.2 +
      normalizedProfitFactor * 0.2 +
      normalizedMaxDD * 0.15 +
      normalizedConsistency * 0.15 +
      normalizedRisk * 0.1,
      100 // Cap score at 100
    );

    // Store the score for the current date (overwriting if multiple trades on same day)
    dailyScores[currentDateKey] = parseFloat(score.toFixed(2));
  }

   // Convert daily scores map to array format for charts
   for (const [date, score] of Object.entries(dailyScores)) {
    result.push({ date, score });
  }

  // Sort the final result by date
  return result.sort((a, b) => new Date(a.date) - new Date(b.date));
}


/**
 * Calculates the maximum drawdown value (in currency units).
 * @param {Array} trades - Array of trade objects.
 * @returns {number} - The maximum drawdown value (always positive or zero).
 */
export function getMaxDrawdownValue(trades) {
  if (!trades || trades.length === 0) return 0;

  const sorted = [...trades].sort(
    (a, b) => new Date(a.entryTime) - new Date(b.entryTime)
  );

  let peakEquity = 0;
  let maxDDValue = 0;
  let cumulativeEquity = 0;

  for (const t of sorted) {
     if (!t.entryTime || !dayjs(t.entryTime).isValid()) continue;
    const pnl = typeof t.pnl === 'number' ? t.pnl : 0;
    const commission = typeof t.commission === 'number' ? t.commission : 0;
    const fees = typeof t.fees === 'number' ? t.fees : 0;
    const netPnL = pnl - commission - fees;

    cumulativeEquity += netPnL;
    peakEquity = Math.max(peakEquity, cumulativeEquity);
    const currentDrawdown = peakEquity - cumulativeEquity; // Drawdown value
    maxDDValue = Math.max(maxDDValue, currentDrawdown);
  }

  return parseFloat(maxDDValue.toFixed(2));
}

/**
 * Calculates the Recovery Factor (Total Net PnL / Max Drawdown Value).
 * Uses the revised getMaxDrawdownValue function.
 * @param {Array} trades - Array of trade objects.
 * @returns {number|string} - The recovery factor, or "Infinity" if drawdown is zero.
 */
export function getRecoveryFactor(trades) {
  if (!trades || trades.length === 0) return 0;

  const netProfit = trades.reduce((acc, t) => {
     const pnl = typeof t.pnl === 'number' ? t.pnl : 0;
     const commission = typeof t.commission === 'number' ? t.commission : 0;
     const fees = typeof t.fees === 'number' ? t.fees : 0;
     return acc + (pnl - commission - fees);
  }, 0);

  const maxDDValue = getMaxDrawdownValue(trades);

  if (maxDDValue === 0) {
    return netProfit > 0 ? "Infinity" : 0; // Avoid division by zero
  }

  return parseFloat((netProfit / maxDDValue).toFixed(2));
}


// --- Functions moved from Dashboard.jsx ---

/**
 * Calculates the percentage of winning trades.
 * @param {Array} trades - Array of trade objects.
 * @returns {string} - Win percentage formatted to 2 decimal places, or "0.00".
 */
export function getTradeWinPercent(trades) {
  if (!trades || trades.length === 0) return "0.00";
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.pnl > 0).length;
  return ((wins / totalTrades) * 100).toFixed(2);
}

/**
 * Calculates the Profit Factor (Gross Profit / Gross Loss).
 * @param {Array} trades - Array of trade objects.
 * @returns {string} - Profit Factor formatted to 2 decimal places, "Infinity", or "0.00".
 */
export function getProfitFactor(trades) {
  if (!trades || trades.length === 0) return "0.00";
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);

  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));

  if (grossLoss === 0) {
    return grossProfit > 0 ? "Infinity" : "0.00";
  }
  return (grossProfit / grossLoss).toFixed(2);
}

/**
 * Calculates the ratio of Average Win PnL to Average Loss PnL.
 * @param {Array} trades - Array of trade objects.
 * @returns {string} - Avg Win/Loss Ratio formatted to 2 decimal places, "Infinity", "0.00", or "N/A".
 */
export function getAvgWinLossRatio(trades) {
   if (!trades || trades.length === 0) return "N/A";
   const wins = trades.filter((t) => t.pnl > 0);
   const losses = trades.filter((t) => t.pnl < 0);

   if (wins.length === 0 && losses.length === 0) return "N/A";

   const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
   const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));

   const avgWin = wins.length ? grossProfit / wins.length : 0;
   const avgLoss = losses.length ? grossLoss / losses.length : 0;

   if (avgLoss === 0) {
     return avgWin > 0 ? "Infinity" : (losses.length > 0 ? "0.00" : "N/A"); // Handle case where losses exist but sum to 0
   }
   if (wins.length === 0) {
       return "0.00";
   }

   return (avgWin / avgLoss).toFixed(2);
}

/**
 * Calculates the percentage of profitable trading days.
 * @param {Array} trades - Array of trade objects.
 * @returns {string} - Day win percentage formatted to 2 decimal places, or "0.00".
 */
export function getDayWinPercent(trades) {
  if (!trades || trades.length === 0) return "0.00";

  const dailyPnL = {};
  trades.forEach(t => {
    if (t.entryTime && dayjs(t.entryTime).isValid()) {
        const day = dayjs(t.entryTime).format("YYYY-MM-DD");
        if (!dailyPnL[day]) {
            dailyPnL[day] = 0;
        }
        dailyPnL[day] += (t.pnl || 0);
    }
  });

  const tradingDays = Object.keys(dailyPnL);
  if (tradingDays.length === 0) return "0.00";

  const winningDays = tradingDays.filter(day => dailyPnL[day] > 0).length;

  return ((winningDays / tradingDays.length) * 100).toFixed(2);
}
