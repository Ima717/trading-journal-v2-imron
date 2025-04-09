import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ChartZellaScore = ({ score = 75.05, metrics = [70, 85, 65, 55, 40, 75] }) => {
  const normalizedScore = Number.isFinite(score) ? Math.min(Math.max(score, 0), 100) : 0;

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
        data: metrics,
        backgroundColor: "rgba(139, 92, 246, 0.3)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(139, 92, 246, 1)",
        pointRadius: 3,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          display: false,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          lineWidth: 1,
        },
        angleLines: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        pointLabels: {
          color: "#444",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    layout: {
      padding: 0,
    },
  };

  return (
    <div className="w-[320px] bg-white shadow border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800 text-sm">Zella score</span>
        <span className="text-gray-400 text-xs cursor-default">ℹ️</span>
      </div>

      <div className="relative w-full h-[240px] mb-6">
        <Radar data={radarData} options={radarOptions} />
      </div>

      <div className="border-t border-gray-200 pt-3">
        <div className="text-sm text-gray-500 mb-1">Your Zella Score</div>

        <div className="flex items-center gap-2">
          <div className="text-[22px] font-semibold text-gray-900">{normalizedScore}</div>
          <div className="flex-1 relative h-[6px] bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 rounded-full"
              style={{
                width: `${normalizedScore}%`,
                background: "linear-gradient(to right, #f87171, #facc15, #4ade80)",
              }}
            />
            <div
              className="absolute top-[-4px] h-5 w-5 rounded-full bg-white border border-gray-300 shadow-md"
              style={{
                left: `${normalizedScore}%`,
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-[2px]">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

export default ChartZellaScore;
