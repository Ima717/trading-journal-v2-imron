import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useFilters } from "../context/FilterContext";

const ChartPnLBySymbol = () => {
  const { filteredTrades } = useFilters();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [topGainer, setTopGainer] = useState({ symbol: "N/A", pnl: 0, count: 0 });
  const [topLoser, setTopLoser] = useState({ symbol: "N/A", pnl: 0, count: 0 });

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

    const labels = Object.keys(symbolMap);
    const avgPnLs = labels.map(
      (symbol) => symbolMap[symbol].totalPnL / symbolMap[symbol].count
    );

    // Identify top gainer and loser
    let gainer = { symbol: "N/A", pnl: -Infinity, count: 0 };
    let loser = { symbol: "N/A", pnl: Infinity, count: 0 };

    labels.forEach((symbol) => {
      const avgPnl = symbolMap[symbol].totalPnL / symbolMap[symbol].count;
      if (avgPnl > gainer.pnl) {
        gainer = { symbol, pnl: avgPnl, count: symbolMap[symbol].count };
      }
      if (avgPnl < loser.pnl) {
        loser = { symbol, pnl: avgPnl, count: symbolMap[symbol].count };
      }
    });

    setTopGainer(gainer);
    setTopLoser(loser);

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
              val >= 0 ? "#22c55e" : "#ef4444"
            ),
            borderRadius: 6,
            barThickness: 18,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111827",
            titleColor: "#fff",
            bodyColor: "#d1d5db",
            borderColor: "#22c55e",
            borderWidth: 1,
            cornerRadius: 6,
            padding: 12,
            callbacks: {
              label: (ctx) => `$${ctx.raw.toFixed(2)} Avg P&L`,
              title: (items) => `Symbol: ${items[0].label}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#6b7280",
              font: { size: 12, family: "Inter" },
              maxRotation: 45,
              minRotation: 45,
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#6b7280",
              font: { size: 12, family: "Inter" },
            },
            title: { display: false },
            grid: {
              color: "rgba(0,0,0,0.06)",
              drawTicks: false,
              borderDash: [2, 4],
            },
          },
        },
      },
    });
  }, [filteredTrades]);

  return (
    <div className="flex flex-col md:flex-row w-full gap-6 bg-white dark:bg-zinc-900 rounded-lg p-6">
      {/* Chart */}
      <div className="w-full md:w-[72%] h-[400px] flex items-center">
        <canvas ref={chartRef} className="w-full h-full" />
      </div>

      {/* Stats */}
      <div className="w-full md:w-[28%] flex flex-col justify-center gap-6 text-sm pr-2 md:pr-6">
        <div className="border-l-4 pl-4 border-green-500">
          <div className="text-xs uppercase text-green-600 dark:text-green-400 mb-1 tracking-wide">
            Top Gainer
          </div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400 font-mono">
            {topGainer.symbol}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-xs">
            +${topGainer.pnl.toFixed(2)} avg P&L{" "}
            <span className="whitespace-nowrap">({topGainer.count} trades)</span>
          </div>
        </div>

        <div className="border-l-4 pl-4 border-red-500">
          <div className="text-xs uppercase text-red-600 dark:text-red-400 mb-1 tracking-wide">
            Top Loser
          </div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400 font-mono">
            {topLoser.symbol}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-xs">
            -${Math.abs(topLoser.pnl).toFixed(2)} avg P&L{" "}
            <span className="whitespace-nowrap">({topLoser.count} trades)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPnLBySymbol;
