// ChartSymbolDistribution.jsx
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useFilters } from "../context/FilterContext";

const ChartSymbolDistribution = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { filteredTrades } = useFilters();

  useEffect(() => {
    if (!filteredTrades || filteredTrades.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const tradeCounts = {};
    filteredTrades.forEach((trade) => {
      const symbol = trade.symbol || "Unknown";
      tradeCounts[symbol] = (tradeCounts[symbol] || 0) + 1;
    });

    const labels = Object.keys(tradeCounts);
    const data = Object.values(tradeCounts);

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Trades per Symbol",
            data,
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "#3b82f6",
            borderWidth: 1,
            barThickness: 30,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw} trades`,
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Symbol",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Trade Count",
            },
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }, [filteredTrades]);

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm mb-6">
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-semibold">
        📊 Trade Distribution by Symbol
      </h3>
      <div className="h-[400px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default ChartSymbolDistribution;
