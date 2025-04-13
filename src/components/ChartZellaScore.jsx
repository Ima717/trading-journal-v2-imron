import React, { useState, useMemo, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler);

// Time period options for the chart
const TIME_PERIODS = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
  { label: "All", days: 0 },
];

// Threshold levels for score evaluation - these could be configurable per user
const THRESHOLDS = {
  excellent: 80,
  good: 60,
  average: 40,
  poor: 20,
};

const ChartZellaScore = ({ data, userTarget = 75 }) => {
  const [activePeriod, setActivePeriod] = useState("1M");
  const [isBreakdownVisible, setIsBreakdownVisible] = useState(false);
  const [periodData, setPeriodData] = useState({
    score: 0,
    change: 0,
    percentChange: 0,
    breakdown: {},
  });
  
  // Check if data exists and has entries
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] flex-1 h-24 flex flex-col justify-center items-center text-gray-500 dark:text-gray-400 text-sm">
        No Zella Score data available
      </div>
    );
  }

  // Filter data based on selected time period
  const filteredData = useMemo(() => {
    if (activePeriod === "All") return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const selectedPeriod = TIME_PERIODS.find(p => p.label === activePeriod);
    if (!selectedPeriod) return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod.days);
    
    return [...data]
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data, activePeriod]);

  // Calculate period analytics when filteredData changes
  useEffect(() => {
    if (filteredData.length === 0) return;

    // Get latest score
    const latest = filteredData[filteredData.length - 1];
    const currentScore = latest?.score ?? 0;
    
    // Calculate previous period for comparison
    const selectedPeriod = TIME_PERIODS.find(p => p.label === activePeriod);
    let previousPeriodData = [];
    
    if (selectedPeriod && selectedPeriod.days > 0) {
      const currentPeriodStartDate = new Date();
      currentPeriodStartDate.setDate(currentPeriodStartDate.getDate() - selectedPeriod.days);
      
      const previousPeriodStartDate = new Date(currentPeriodStartDate);
      previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - selectedPeriod.days);
      
      previousPeriodData = data.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= previousPeriodStartDate && entryDate < currentPeriodStartDate;
      });
    } else {
      // For "All" time period, compare first half with second half
      const midPoint = Math.floor(data.length / 2);
      previousPeriodData = data.slice(0, midPoint);
    }
    
    // Calculate average score from previous period
    const previousPeriodAvg = previousPeriodData.length > 0 
      ? previousPeriodData.reduce((sum, entry) => sum + entry.score, 0) / previousPeriodData.length 
      : currentScore;
    
    // Calculate change and percent change
    const change = currentScore - previousPeriodAvg;
    const percentChange = previousPeriodAvg !== 0 
      ? (change / previousPeriodAvg) * 100 
      : 0;
    
    // Calculate score breakdown components (assuming data contains these values)
    // This uses the most recent trade data to calculate components
    const tradeData = filteredData.flatMap(entry => entry.trades || []);
    
    // Calculate win rate
    const winningTrades = tradeData.filter(trade => trade.pnl > 0).length;
    const totalTrades = tradeData.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    // Calculate profit factor
    const grossProfit = tradeData
      .filter(trade => trade.pnl > 0)
      .reduce((sum, trade) => sum + trade.pnl, 0);
    const grossLoss = Math.abs(
      tradeData
        .filter(trade => trade.pnl < 0)
        .reduce((sum, trade) => sum + trade.pnl, 0)
    );
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    
    // Calculate average risk-reward ratio
    const avgRiskReward = tradeData.length > 0
      ? tradeData.reduce((sum, trade) => sum + (trade.reward / (trade.risk || 1)), 0) / tradeData.length
      : 0;
    
    // Calculate max drawdown (simplified method)
    let maxDrawdown = 0;
    let peak = 0;
    let cumulativePnL = 0;
    
    // Sort by date and calculate drawdown
    [...filteredData]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(entry => {
        const dailyPnL = (entry.trades || []).reduce((sum, trade) => sum + trade.pnl, 0);
        cumulativePnL += dailyPnL;
        
        if (cumulativePnL > peak) {
          peak = cumulativePnL;
        }
        
        const drawdown = ((peak - cumulativePnL) / peak) * 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      });
    
    setPeriodData({
      score: currentScore,
      change,
      percentChange,
      breakdown: {
        "Win Rate": `${winRate.toFixed(1)}%`,
        "Profit Factor": profitFactor.toFixed(2),
        "Risk-Reward": `1:${avgRiskReward.toFixed(2)}`,
        "Max Drawdown": `${maxDrawdown.toFixed(1)}%`,
      }
    });
  }, [filteredData, data, activePeriod]);

  // Determine background color based on score
  const getScoreBackground = (scoreValue) => {
    if (scoreValue >= THRESHOLDS.excellent) return "bg-emerald-100 text-emerald-700";
    if (scoreValue >= THRESHOLDS.good) return "bg-green-100 text-green-700";
    if (scoreValue >= THRESHOLDS.average) return "bg-yellow-100 text-yellow-700";
    if (scoreValue >= THRESHOLDS.poor) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  // Get change indicator class
  const getChangeIndicator = () => {
    if (periodData.change > 0) return "text-green-500";
    if (periodData.change < 0) return "text-red-500";
    return "text-gray-500";
  };

  // Calculate average score for the current period
  const averageScore = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return filteredData.reduce((sum, entry) => sum + entry.score, 0) / filteredData.length;
  }, [filteredData]);

  // Calculate appropriate time unit based on data range
  const getTimeUnit = () => {
    const firstDate = new Date(filteredData[0]?.date);
    const lastDate = new Date(filteredData[filteredData.length - 1]?.date);
    const daysDifference = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > 180) return "month";
    if (daysDifference > 30) return "week";
    return "day";
  };

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    // Sort data chronologically
    const chronologicalData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      datasets: [
        {
          label: "Zella Score",
          data: chronologicalData.map((entry) => ({
            x: new Date(entry.date),
            y: entry.score,
          })),
          borderColor: "#2dd4bf",
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { chartArea, ctx: canvas } = chart;
            if (!chartArea) return "rgba(0,0,0,0)";

            const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(45, 212, 191, 0.35)");
            gradient.addColorStop(1, "rgba(45, 212, 191, 0.05)");
            return gradient;
          },
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "#2dd4bf",
          borderWidth: 2,
        },
        // User target line
        {
          label: "Target",
          data: chronologicalData.map(() => userTarget),
          borderColor: "rgba(99, 102, 241, 0.6)",
          borderWidth: 1.5,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
        },
        // Average line for this period
        {
          label: "Period Average",
          data: chronologicalData.map(() => averageScore),
          borderColor: "rgba(156, 163, 175, 0.6)",
          borderWidth: 1,
          borderDash: [3, 3],
          fill: false,
          pointRadius: 0,
        }
      ],
    };
  }, [filteredData, userTarget, averageScore]);

  // Chart configuration
  const chartOptions = useMemo(() => {
    const timeUnit = getTimeUnit();
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 5,
          right: 5,
          top: 10,
          bottom: 5,
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: timeUnit,
            tooltipFormat: "MMM d, yyyy",
            displayFormats: { 
              day: "MMM d",
              week: "MMM d",
              month: "MMM yyyy" 
            },
          },
          grid: {
            display: false,
          },
          ticks: {
            display: filteredData.length < 60,
            maxRotation: 45,
            color: "rgba(156, 163, 175, 0.8)",
          },
          border: {
            display: false,
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: "rgba(156, 163, 175, 0.1)",
            drawTicks: false,
          },
          ticks: {
            stepSize: 20,
            color: "rgba(156, 163, 175, 0.8)",
          },
          border: {
            display: false,
          }
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          titleColor: "#333",
          bodyColor: "#333",
          titleFont: { size: 12, weight: "normal" },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => tooltipItems[0].label,
            label: (context) => `Score: ${context.parsed.y.toFixed(1)}`,
            afterLabel: (context) => {
              // Calculate difference from average and target
              const diffFromAvg = (context.parsed.y - averageScore).toFixed(1);
              const diffFromTarget = (context.parsed.y - userTarget).toFixed(1);
              
              return [
                `vs. Period Avg: ${diffFromAvg > 0 ? "+" : ""}${diffFromAvg}`,
                `vs. Target: ${diffFromTarget > 0 ? "+" : ""}${diffFromTarget}`
              ];
            }
          },
        },
      },
      // Draw threshold line after the chart is rendered
      plugins: [{
        id: 'thresholdLines',
        beforeDraw: (chart) => {
          const { ctx, scales: { y }, chartArea: { left, right } } = chart;
          
          // Draw average threshold line
          const averageY = y.getPixelForValue(THRESHOLDS.average);
          ctx.save();
          ctx.strokeStyle = "rgba(220, 38, 38, 0.3)";
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(left, averageY);
          ctx.lineTo(right, averageY);
          ctx.stroke();
          ctx.restore();
        }
      }],
    };
  }, [filteredData, averageScore, userTarget, getTimeUnit]);

  // Animation variants for the breakdown section
  const breakdownVariants = {
    open: { 
      opacity: 1, 
      height: "auto",
      marginTop: 8,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    closed: { 
      opacity: 0, 
      height: 0,
      marginTop: 0,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] flex-1"
    >
      <div className="flex justify-between items-center px-4 pt-4 pb-2 border-b border-gray-100 dark:border-zinc-700">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Zella Score</h3>
          <button 
            className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" 
            title="The Zella Score is a composite metric measuring your trading performance across multiple factors"
          >
            <Info size={14} />
          </button>
        </div>
        
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 20
          }}
          className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(periodData.score)} dark:bg-opacity-50`}
        >
          {periodData.score.toFixed(1)}
        </motion.div>
      </div>

      {/* Score change indicator */}
      <div className="flex items-center px-4 pt-2 text-xs">
        <span className={`flex items-center ${getChangeIndicator()}`}>
          {periodData.change > 0 ? <ChevronUp size={14} /> : periodData.change < 0 ? <ChevronDown size={14} /> : "–"}
          {Math.abs(periodData.percentChange).toFixed(1)}%
        </span>
        <span className="ml-1 text-gray-500">from previous period</span>
      </div>
      
      {/* Time period selector */}
      <div className="flex space-x-1 px-4 py-2">
        {TIME_PERIODS.map((period) => (
          <button
            key={period.label}
            className={`px-2 py-1 text-xs rounded transition-colors duration-150 ${
              activePeriod === period.label
                ? "bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-100"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
            }`}
            onClick={() => setActivePeriod(period.label)}
          >
            {period.label}
          </button>
        ))}
      </div>
      
      {/* Chart area */}
      <div className="px-2 pt-1 pb-2 h-48">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      {/* Score breakdown section */}
      <div className="px-4 pt-1 pb-3 border-t border-gray-100 dark:border-zinc-700">
        <button
          className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-300 py-1 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
          onClick={() => setIsBreakdownVisible(!isBreakdownVisible)}
        >
          <span className="font-medium">Score Breakdown</span>
          {isBreakdownVisible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        <AnimatePresence>
          {isBreakdownVisible && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={breakdownVariants}
              className="overflow-hidden text-xs grid grid-cols-2 gap-2"
            >
              {Object.entries(periodData.breakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500">{key}:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
