// ChartPnLBySymbol.jsx
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useFilters } from "../context/FilterContext";

const ChartPnLBySymbol = () => {
  const { filteredTrades } = useFilters();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!filteredTrades || filteredTrades.length === 0) return;

    const symbolMap = {};
    filteredTrades.forEach((trade) => {
      const symbol = trade.symbol || "Unknown";
      if (!symbolMap[symbol]) {
        symbolMap[symbol] = { totalPnL: 0, count: 0 };
      }
      symbolMap[symbol].totalPnL += trade.pnl || 0;
      symbolMap[symbol].count += 1;
    });

    const labels = Object.keys(symbolMap);
    const avgPnLs = labels.map(
      (symbol) => symbolMap[symbol].totalPnL / symbolMap[symbol].count
    );

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Avg P&L ($)",
            data: avgPnLs,
            backgroundColor: avgPnLs.map((val) =>
              val >= 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"
            ),
            borderColor: avgPnLs.map((val) =>
              val >= 0 ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)"
            ),
            borderWidth: 1.5,
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
              label: (ctx) => `$${ctx.raw.toFixed(2)} Avg P&L`,
              title: (items) => `Symbol: ${items[0].label}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Avg P&L ($)",
              color: "#6b7280",
              font: { weight: "bold", family: "Inter" },
            },
            ticks: { color: "#6b7280" },
            grid: { color: "#e5e7eb" },
          },
          x: {
            ticks: { color: "#6b7280" },
            grid: { display: false },
          },
        },
      },
    });
  }, [filteredTrades]);

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-semibold">
        💸 P&L by Symbol
      </h3>
      <div className="h-[400px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default ChartPnLBySymbol;
