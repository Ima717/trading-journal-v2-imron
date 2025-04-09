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
      const match = symbol.match(/^([A-Z]+)([0-9]{6}[CP][0-9]+)$/);
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

    // Sort by absolute avgPnL and take top 6
    const topSymbols = aggregated
      .sort((a, b) => Math.abs(b.avgPnL) - Math.abs(a.avgPnL))
      .slice(0, 6);

    const labels = topSymbols.map((s) => s.symbol);
    const data = topSymbols.map((s) => s.avgPnL);
    const counts = topSymbols.map((s) => s.count);

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
            backgroundColor: data.map((val) =>
              val >= 0 ? "#22c55e" : "#ef4444"
            ),
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
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
        PnL by Symbol (Top 6)
      </div>
      <div className="min-h-[360px]">
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default ChartPnLBySymbol;
