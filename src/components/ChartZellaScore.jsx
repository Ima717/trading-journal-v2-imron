import React, { useEffect, useRef } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

const ChartZellaScore = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const latest = data[data.length - 1];
  const score = latest?.score ?? 75.05; // Using the example score from screenshot

  // Creating a proper container ref for measurement
  const containerRef = useRef(null);

  // Calculate proper position for the score indicator
  const scorePosition = Math.min(Math.max(score, 0), 100);
  
  // Radar chart data
  const radarData = {
    labels: [
      "Win %",
      "Profit factor",
      "Avg win/loss",
      "Recovery factor",
      "Max drawdown",
      "Consistency",
    ],
    datasets: [
      {
        label: "Zella Metrics",
        data: [70, 65, 58, 45, 50, 66], // Sample metrics matching screenshot pattern
        backgroundColor: "rgba(124, 58, 237, 0.3)", // Soft purple with 30% opacity
        borderColor: "rgba(124, 58, 237, 0.8)",
        pointBackgroundColor: "rgba(124, 58, 237, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(124, 58, 237, 1)",
        pointRadius: 3,
        borderWidth: 1.5,
      },
    ],
  };

  // Radar chart options for the exact look and feel
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { 
          display: false,
          backdropColor: "transparent",
        },
        angleLines: {
          color: "rgba(180, 180, 180, 0.2)", // Very light gray for axis lines
        },
        grid: { 
          color: "rgba(180, 180, 180, 0.15)", // Light gray with transparency for grid lines
          circular: true,
        },
        pointLabels: {
          color: "rgba(100, 100, 100, 0.7)", // Subtle gray for labels
          font: { 
            size: 11,
            family: "'Inter', sans-serif"
          },
          padding: 12, // Give more space around labels
        },
      },
    },
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#333",
        titleFont: {
          size: 12,
          weight: "normal"
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.raw}%`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.2, // Slight smoothing of lines
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-lg p-4 w-full max-w-md"
    >
      {/* Title with info icon */}
      <div className="flex items-center mb-2 px-1">
        <div className="ml-1 w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-xs font-light">i</span>
        </div>
      </div>
      
      {/* Light separator */}
      <div className="w-full h-px bg-gray-100 mb-5"></div>
      
      {/* Radar Chart container - giving it proper height */}
      <div className="w-full h-52 mb-6">
        <Radar data={radarData} options={radarOptions} />
      </div>
      
      {/* Score section */}
      <div className="w-full flex flex-col px-4 pb-2">
        <span className="text-xs text-gray-500 mb-1">Your Zella Score</span>
        
        {/* Score container */}
        <div className="flex items-center gap-4">
          {/* The actual score value */}
          <div className="text-2xl font-semibold text-gray-800">
            {score.toFixed(2)}
          </div>
          
          {/* Score bar container */}
          <div className="relative flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            {/* Gradient background */}
            <div 
              className="absolute top-0 left-0 h-full w-full rounded-full"
              style={{
                background: "linear-gradient(to right, #e03131 0%, #f08c00 35%, #2b8a3e 65%, #e9ecef 95%)",
              }}
            />
            
            {/* Score indicator dot */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-teal-500 z-10"
              style={{
                left: `${scorePosition}%`,
                marginLeft: "-4px", // Half the width to center it
              }}
            />
          </div>
        </div>
        
        {/* Score legend */}
        <div className="flex justify-between mt-1 text-xs text-gray-400 px-1">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartZellaScore;
