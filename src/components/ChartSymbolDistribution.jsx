import React, { useEffect, useRef, useState, useMemo } from "react";
import Chart from "chart.js/auto";
import { useFilters } from "../context/FilterContext";

const getBaseSymbol = (symbol) => symbol?.match(/^([A-Z]+)/)?.[1] || "Unknown";

const ChartSymbolDistribution = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { filteredTrades } = useFilters();
  const [sortBy, setSortBy] = useState("count"); // "count" or "symbol"

  const colorPalette = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1",
    "#14b8a6", "#8b5cf6", "#e11d48", "#f97316", "#0ea5e9"
  ];

  // Prepare trade count data grouped by base symbol
  const symbolStats = useMemo(() => {
    const counts = {};
    filteredTrades?.forEach((trade) => {
      const symbol = getBaseSymbol(trade.symbol);
      counts[symbol] = (counts[symbol] || 0) + 1;
    });
    const entries = Object.entries(counts).map(([symbol, count]) => ({ symbol, count }));
    if (sortBy === "count") {
      return entries.sort((a, b) => b.count - a.count);
    }
    return entries.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [filteredTrades, sortBy]);

  // Extract chart data
  const labels = symbolStats.map((entry) => entry.symbol);
  const data = symbolStats.map((entry) => entry.count);

  useEffect(() => {
    if (!chartRef.current || !filteredTrades || filteredTrades.length === 0) return;

    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Trades per Symbol",
            data,
            backgroundColor: labels.map((_, i) => colorPalette[i % colorPalette.length]),
            borderRadius: 6,
            barThickness: 28,
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
  }, [labels, data]);

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          📊 Trade Distribution by Symbol
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-zinc-600 rounded-md px-2 py-1"
        >
          <option value="count">Sort: Most Trades</option>
          <option value="symbol">Sort: A–Z</option>
        </select>
      </div>

      <div className="h-[400px]">
        <canvas ref={chartRef} />
      </div>

      {/* Summary Section */}
      {symbolStats.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🔝 Top Symbols
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {symbolStats.slice(0, 3).map((entry, i) => (
              <li key={entry.symbol}>
                {i + 1}. <span className="font-medium">{entry.symbol}</span> — {entry.count} trades
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChartSymbolDistribution;
