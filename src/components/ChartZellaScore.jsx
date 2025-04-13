import React, { useState, useMemo } from "react";
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
import { motion } from "framer-motion";
import { valueAnimation } from "../utils/statUtils.jsx";
import { ChevronDown, ChevronUp, Calendar, Info } from "lucide-react";

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

// Threshold levels for score evaluation
const THRESHOLDS = {
  excellent: 80,
  good: 60,
  average: 40,
  poor: 20,
};

const ChartZellaScore = ({ data, scoreMetadata = {} }) => {
  const [activePeriod, setActivePeriod] = useState("1M");
  const [isBreakdownVisible, setIsBreakdownVisible] = useState(false);
  
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl shadow-sm bg-white dark:bg-zinc-800 min-w-[250px] flex-1 h-24 flex flex-col justify-center items-center text-gray-500 dark:text-gray-400 text-sm">
        No Zella Score data available
      </div>
    );
  }

  // Get the latest score data
  const latest = data[data.length - 1];
  const score = latest?.score ?? 0;
  
  // Calculate change from previous period
  const previousIndex = data.length > 1 ? data.length - 2 : 0;
  const previousScore = data[previousIndex]?.score ?? score;
  const scoreDiff = score - previousScore;
  const percentChange = previousScore !== 0 ? (scoreDiff / previousScore) * 100 : 0;

  // Filter data based on selected time period
  const filteredData = useMemo(() => {
    if (activePeriod === "All") return data;
    
    const selectedPeriod = TIME_PERIODS.find(p => p.label === activePeriod);
    if (!selectedPeriod) return data;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod.days);
    
    return data.filter(entry => new Date(entry.date) >= cutoffDate);
  }, [data, activePeriod]);

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
    if (scoreDiff > 0) return "text-green-500";
    if (scoreDiff < 0) return "text-red-500";
    return "text-gray-500";
  };

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: "Zella Score",
          data: filteredData.map((entry) => ({
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
        // Optional: Add your average historical score line
        {
          label: "Your Average",
          data: filteredData.map(() => 65), // Replace with actual historical average
          borderColor: "rgba(156, 163, 175, 0.6)",
          borderWidth: 1,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
        },
      ],
    }),
    [filteredData]
  );

  const chartOptions = {
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
          unit: filteredData.length > 90 ? "month" : "day",
          tooltipFormat: "MMM d, yyyy",
          displayFormats: { 
            day: "MMM d",
            month: "MMM yyyy" 
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          display: filteredData.length < 60, // Only show dates on shorter timeframes
          maxRotation: 45,
          color: "rgba(156, 163, 175, 0.8)",
        },
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
        // Add threshold lines
        afterDraw: (chart) => {
          const ctx = chart.ctx;
          const yAxis = chart.scales.y;
          const chartArea = chart.chartArea;
          
          ctx.save();
          ctx.strokeStyle = "rgba(220, 38, 38, 0.3)";
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          const y = yAxis.getPixelForValue(THRESHOLDS.average);
          ctx.moveTo(chartArea.left, y);
          ctx.lineTo(chartArea.right, y);
          ctx.stroke();
          ctx.restore();
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
            // You could add more details here based on the day's data
            return `vs. Avg: ${(context.parsed.y - 65).toFixed(1)}`;
          }
        },
      },
    },
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
            title="The Zella Score measures your overall trading performance"
          >
            <Info size={14} />
          </button>
        </div>
        
        <motion.div
          {...valueAnimation}
          className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(score)} dark:bg-opacity-50`}
        >
          {score.toFixed(1)}
        </motion.div>
      </div>

      {/* Score change indicator */}
      <div className="flex items-center px-4 pt-2 text-xs">
        <span className={`flex items-center ${getChangeIndicator()}`}>
          {scoreDiff > 0 ? <ChevronUp size={14} /> : scoreDiff < 0 ? <ChevronDown size={14} /> : "–"}
          {Math.abs(percentChange).toFixed(1)}%
        </span>
        <span className="ml-1 text-gray-500">from previous period</span>
      </div>
      
      {/* Time period selector */}
      <div className="flex space-x-1 px-4 py-2">
        {TIME_PERIODS.map((period) => (
          <button
            key={period.label}
            className={`px-2 py-1 text-xs rounded ${
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
          className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-300"
          onClick={() => setIsBreakdownVisible(!isBreakdownVisible)}
        >
          <span className="font-medium">Score Breakdown</span>
          {isBreakdownVisible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {isBreakdownVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-2 text-xs grid grid-cols-2 gap-2"
          >
            {Object.entries(scoreMetadata).length > 0 ? (
              <>
                {Object.entries(scoreMetadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500">{key}:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{value}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Win Rate:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">68%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Profit Factor:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">2.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Risk-Reward:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">1:2.5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Drawdown:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">8.3%</span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
