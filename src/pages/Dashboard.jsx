import React, { useEffect, useState, useMemo } from "react";
// ... other imports
import { useFilters } from "../context/FilterContext"; // Make sure this is imported if not already
// ... other imports

// Import ALL calculation functions needed from the updated utils file
import {
  getPnLOverTime,
  getZellaScoreOverTime,
  getMaxDrawdownValue, // Use the revised function for value
  getRecoveryFactor, // Use the revised function
  getTradeWinPercent, // New import
  getProfitFactor, // New import
  getAvgWinLossRatio, // New import (check name)
  getDayWinPercent, // New import
} from "../utils/calculations"; // Adjust path if needed

// ... other components like TradeTabs, ChartTagPerformance etc.

const Dashboard = () => {
  // ... existing hooks (navigate, user, theme, dateRange, filteredTrades)
  // ... existing state (localTrades, isLoading, error)
  // ... existing user check and return

  // ... existing useEffect for fetching data (keep as is)

  // UseMemo for displayTrades (keep as is)
  const displayTrades = useMemo(() => {
     return filteredTrades.length > 0 && filteredTrades.every((t) => t.pnl !== undefined)
       ? filteredTrades
       : localTrades;
   }, [filteredTrades, localTrades]);

  // --- Updated Metrics Calculation using imported functions ---

  const pnlData = useMemo(() => getPnLOverTime(displayTrades), [displayTrades]);
  const zellaTrendData = useMemo(() => getZellaScoreOverTime(displayTrades), [displayTrades]);
  const tagPerformanceData = useMemo(() => {
    // Keep your existing tag performance logic here
    const tagMap = {};
     displayTrades.forEach((trade) => {
       if (Array.isArray(trade.tags)) {
         trade.tags.forEach((tag) => {
           if (!tagMap[tag]) tagMap[tag] = { totalPnL: 0, count: 0 };
           tagMap[tag].totalPnL += trade.pnl || 0;
           tagMap[tag].count += 1;
         });
       }
     });
     return Object.entries(tagMap).map(([tag, val]) => ({
       tag,
       avgPnL: parseFloat((val.totalPnL / val.count).toFixed(2)),
     }));
  }, [displayTrades]);

  // Use the new functions for core metrics
  const totalTrades = displayTrades.length; // Keep simple length calculation
  const netPnL = useMemo(() => displayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0), [displayTrades]); // Keep simple reduce or create util if preferred

  const tradeWinPercent = useMemo(() => getTradeWinPercent(displayTrades), [displayTrades]);
  const profitFactor = useMemo(() => getProfitFactor(displayTrades), [displayTrades]);
  const avgWinLossRatio = useMemo(() => getAvgWinLossRatio(displayTrades), [displayTrades]); // Use the new function name
  const dayWinPercent = useMemo(() => getDayWinPercent(displayTrades), [displayTrades]);

  // Use revised functions for drawdown/recovery
  const maxDrawdownValue = useMemo(() => getMaxDrawdownValue(displayTrades), [displayTrades]); // Calculate value
  const recoveryFactor = useMemo(() => getRecoveryFactor(displayTrades), [displayTrades]); // Uses maxDrawdownValue internally now

  // Keep getWinRateBackground function (or move to utils if preferred)
   const getWinRateBackground = () => {
     const winRateValue = parseFloat(tradeWinPercent);
     if (winRateValue > 60)
       return "bg-gradient-to-r from-green-400 to-green-500 text-white";
     if (winRateValue >= 40)
       return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white";
     return "bg-gradient-to-r from-red-400 to-red-500 text-white";
   };


  // --- Rest of your Dashboard component ---
  // (Return statement with JSX, passing the calculated metrics as props to child components)
  // Make sure props passed to child components match the new variable names/values
  // e.g., pass avgWinLossRatio to AvgWinLossCard, pass maxDrawdownValue to DrawdownCard if needed etc.

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-inter">
        <div className="max-w-screen-xl mx-auto px-4 py-6 w-full">
          {/* ... Header ... */}

          {error ? (
             <div className="text-center py-10 text-red-500 dark:text-red-400">{error}</div>
           ) : isLoading ? (
             <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
               {/* ... Loading Spinner ... */}
             </div>
           ) : (
             <>
               {/* First Row: 3 Widgets */}
               <div className="flex flex-wrap gap-6 mb-6 w-full justify-between">
                 <NetPLCard
                   value={netPnL} // Pass netPnL
                   badge={totalTrades}
                   trades={displayTrades}
                 />
                 <TradeWinPercentCard
                   value={tradeWinPercent} // Use variable from useMemo
                   customBg={getWinRateBackground()}
                 />
                 <ProfitFactorCard
                   value={profitFactor} // Use variable from useMemo
                   trades={displayTrades}
                 />
               </div>

               {/* Second Row: 2 Widgets */}
               <div className="flex flex-wrap gap-6 mb-6 w-full justify-between">
                 {/* Ensure AvgWinLossCard receives the correct prop */}
                 <AvgWinLossCard value={avgWinLossRatio} />
                 <DayWinPercentCard value={dayWinPercent} trades={displayTrades} />
               </div>

               {/* Third Row: Charts & Drawdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
                   {/* ... Zella Score Chart ... */}
                   {/* ... Equity Curve Chart ... */}
                  <motion.div /* ... */ >
                     <ChartCard>
                       {/* Update DrawdownCard props if needed */}
                       <DrawdownCard
                         maxDrawdown={maxDrawdownValue} // Pass the value
                         recoveryFactor={recoveryFactor} // Pass the revised factor
                         data={pnlData} // Pass pnlData if needed for chart context
                       />
                     </ChartCard>
                   </motion.div>
                 </div>

                {/* ... Other sections (Calendar, Recent Trades, Symbol Charts, Tag Perf, TradeTabs) ... */}
                {/* Ensure props passed to these components are still correct */}

             </>
           )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;

