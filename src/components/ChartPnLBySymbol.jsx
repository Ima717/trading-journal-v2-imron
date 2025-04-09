import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useFilters } from "../context/FilterContext";

const ChartPnLBySymbol = () => {
  const { filteredTrades } = useFilters();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!filteredTrades || filteredTrades.length === 0) return;

    const getBaseSymbol = (symbol) => {
      const match = symbol?.match(/^([A-Z]+)/);
      return match ? match[1] : symbol;
    };

    const symbolMap = {};
    filteredTrades.forEach((trade) => {
      const baseSymbol = getBaseSymbol(trade.symbol || "Unknown");
      if (!symbolMap[baseSymbol]) {
        symbolMap[baseSymbol] = { totalPnL: 0, count: 0 };
      }
      symbolMap[baseSymbol].totalPnL += trade.pnl || 0;
      symbolMap[baseSymbol].count += 1;
    });

    const aggregated = Object.entries(symbolMap).map(([symbol, data]) => ({
      symbol,
      avgPnL: data.totalPnL / data.count,
      count: data.count,
    }));

    const gainers = aggregated
      .filter((s) => s.avgPnL > 0)
      .sort((a, b) => b.avgPnL - a.avgPnL)
      .slice(0, 3);

    const losers = aggregated
      .filter((s) => s.avgPnL < 0)
      .sort((a, b) => a.avgPnL - b.avgPnL)
      .slice(0, 3);

    const combined = [...gainers, ...losers];
    const labels = combined.map((s) => s.symbol);
    const data = combined.map((s) => s.avgPnL);
    const counts = combined.map((s) => s.count);
    const colors = combined.map((s) => (s.avgPnL >= 0 ? "#22c55e" : "#ef4444"));

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Avg P&L",
            data,
            backgroundColor: colors,
            borderRadius: 6,
            barThickness: 20,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1f2937",
            titleColor: "#fff",
            bodyColor: "#d1d5db",
            padding: 12,
            cornerRadius: 6,
            callbacks: {
              title: (items) => `Symbol: ${items[0].label}`,
              label: (ctx) => {
                const val = ctx.raw.toFixed(2);
                const trades = counts[ctx.dataIndex];
                return `${val >= 0 ? "+" : "-"}$${Math.abs(val)} avg P&L (${trades} trades)`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { drawBorder: false, color: "rgba(0,0,0,0.05)" },
            ticks: {
              color: "#6b7280",
              font: { size: 12, family: "Inter" },
              callback: (val) => `$${val}`,
            },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: "#111827",
              font: { size: 13, family: "Inter", weight: "bold" },
            },
          },
        },
      },
    });
  }, [filteredTrades]);

  return (
    <div className="w-full h-[360px] bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white tracking-wide">
          PnL by Symbol
        </h3>
      </div>

      {/* Chart Canvas */}
      <div className="h-full">
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default ChartPnLBySymbol;
