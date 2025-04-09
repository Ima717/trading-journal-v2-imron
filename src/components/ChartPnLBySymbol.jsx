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

    // Top gainer / loser logic
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

    // Chart setup
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
            borderRadius: 4,
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
            backgroundColor: "#000",
            titleColor: "#fff",
            bodyColor: "#d1d5db",
            borderColor: "#22c55e",
            borderWidth: 1,
            cornerRadius: 4,
            padding: 10,
            callbacks: {
              label: (ctx) => `$${ctx.raw.toFixed(2)} Avg P&L`,
              title: (items) => `Symbol: ${items[0].label}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#94a3b8",
              font: { size: 11, family: "JetBrains Mono" },
              maxRotation: 45,
              minRotation: 45,
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Avg P&L ($)",
              color: "#94a3b8",
              font: { weight: "bold", family: "JetBrains Mono" },
            },
            ticks: {
              color: "#94a3b8",
              font: { size: 11, family: "JetBrains Mono" },
            },
            grid: {
              color: "rgba(255,255,255,0.05)",
              drawTicks: false,
              borderDash: [2, 4],
            },
          },
        },
      },
    });
  }, [filteredTrades]);

  return (
    <div className="flex flex-row w-full gap-6 bg-zinc-900 rounded-lg p-6">
      {/* Chart Side */}
      <div className="w-2/3 h-[400px]">
        <h3 className="text-gray-300 text-sm font-semibold mb-3 tracking-wide">
          Avg P&L by Symbol
        </h3>
        <canvas ref={chartRef} />
      </div>

      {/* Data Summary Side */}
      <div className="w-1/3 flex flex-col justify-center gap-6 text-sm font-mono text-gray-300">
        <div className="border-l-4 pl-4 border-green-500">
          <div className="text-xs uppercase text-green-400 mb-1">Top Gainer</div>
          <div className="text-lg font-bold text-green-500">{topGainer.symbol}</div>
          <div className="text-gray-400 text-xs">
            +${topGainer.pnl.toFixed(2)} avg P&L ({topGainer.count} trades)
          </div>
        </div>
        <div className="border-l-4 pl-4 border-red-500">
          <div className="text-xs uppercase text-red-400 mb-1">Top Loser</div>
          <div className="text-lg font-bold text-red-500">{topLoser.symbol}</div>
          <div className="text-gray-400 text-xs">
            -${Math.abs(topLoser.pnl).toFixed(2)} avg P&L ({topLoser.count} trades)
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPnLBySymbol;
