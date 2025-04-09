import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useFilters } from "../context/FilterContext";
import { motion } from "framer-motion";

const ChartPnLBySymbol = () => {
  const { filteredTrades } = useFilters();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [topGainer, setTopGainer] = useState({ symbol: "N/A", pnl: 0, count: 0 });
  const [topLoser, setTopLoser] = useState({ symbol: "N/A", pnl: 0, count: 0 });

  useEffect(() => {
    if (!filteredTrades || filteredTrades.length === 0) {
      setTopGainer({ symbol: "N/A", pnl: 0, count: 0 });
      setTopLoser({ symbol: "N/A", pnl: 0, count: 0 });
      return;
    }

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

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Avg P&L ($)",
            data: avgPnLs,
            backgroundColor: (context) => {
              const value = context.raw;
              const chart = context.chart;
              const { ctx: chartCtx } = chart;
              if (value >= 0) {
                const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(34, 197, 94, 0.8)"); // Green-500
                gradient.addColorStop(1, "rgba(74, 222, 128, 0.6)"); // Green-400
                return gradient;
              } else {
                const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)"); // Red-500
                gradient.addColorStop(1, "rgba(248, 113, 113, 0.6)"); // Red-400
                return gradient;
              }
            },
            borderColor: avgPnLs.map((val) =>
              val >= 0 ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)"
            ),
            borderWidth: 1,
            borderRadius: 8,
            barThickness: 20,
            hoverBackgroundColor: (context) => {
              const value = context.raw;
              const chart = context.chart;
              const { ctx: chartCtx } = chart;
              if (value >= 0) {
                const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(34, 197, 94, 1)");
                gradient.addColorStop(1, "rgba(74, 222, 128, 0.9)");
                return gradient;
              } else {
                const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(239, 68, 68, 1)");
                gradient.addColorStop(1, "rgba(248, 113, 113, 0.9)");
                return gradient;
              }
            },
            hoverBorderColor: avgPnLs.map((val) =>
              val >= 0 ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)"
            ),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            titleFont: { size: 14, weight: "bold", family: "'Inter', sans-serif" },
            bodyFont: { size: 12, family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 8,
            boxPadding: 4,
            caretSize: 6,
            borderColor: "rgba(59, 130, 246, 0.3)",
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `$${ctx.raw.toFixed(2)} Avg P&L`,
              title: (items) => `Symbol: ${items[0].label}`,
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Symbol",
              color: "#9ca3af",
              font: { size: 14, weight: "600", family: "'Inter', sans-serif" },
              padding: { top: 10 },
            },
            ticks: {
              color: "#9ca3af",
              font: { size: 12, family: "'Inter', sans-serif" },
              maxRotation: 45,
              minRotation: 45,
            },
            grid: {
              display: false,
            },
            border: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Avg P&L ($)",
              color: "#9ca3af",
              font: { size: 14, weight: "600", family: "'Inter', sans-serif" },
              padding: { bottom: 10 },
            },
            ticks: {
              color: "#9ca3af",
              font: { size: 12, family: "'Inter', sans-serif" },
              stepSize: Math.max(...avgPnLs.map(Math.abs)) / 5 || 1,
              padding: 8,
              callback: (value) => `$${value.toFixed(2)}`,
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
              drawBorder: false,
              drawTicks: false,
            },
            border: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
        },
        animation: {
          duration: 1200,
          easing: "easeOutQuart",
        },
        hover: {
          mode: "nearest",
          intersect: true,
          animationDuration: 200,
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [filteredTrades]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-200/60 dark:border-zinc-700/60"
    >
      {filteredTrades && filteredTrades.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Chart Section */}
          <div className="w-full md:w-[74%] min-h-[400px] flex items-center justify-center py-4 px-2">
            <canvas ref={chartRef} className="w-full h-full drop-shadow-sm" />
          </div>

          {/* Gainer/Loser Section */}
          <div className="w-full md:w-[26%] flex flex-col justify-center gap-6 text-sm pr-2 md:pr-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border-l-4 pl-4 border-green-500 bg-green-50/50 dark:bg-green-900/30 rounded-lg py-3"
            >
              <div className="text-xs uppercase text-green-600 dark:text-green-400 mb-1 tracking-wide font-semibold">
                Top Gainer
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400 font-mono">
                {topGainer.symbol}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                +${topGainer.pnl.toFixed(2)} avg P&L{" "}
                <span className="whitespace-nowrap">({topGainer.count} trades)</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="border-l-4 pl-4 border-red-500 bg-red-50/50 dark:bg-red-900/30 rounded-lg py-3"
            >
              <div className="text-xs uppercase text-red-600 dark:text-red-400 mb-1 tracking-wide font-semibold">
                Top Loser
              </div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400 font-mono">
                {topLoser.symbol}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                -${Math.abs(topLoser.pnl).toFixed(2)} avg P&L{" "}
                <span className="whitespace-nowrap">({topLoser.count} trades)</span>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400 text-sm font-medium">
          No trades available to display.
        </div>
      )}
    </motion.div>
  );
};

export default ChartPnLBySymbol;
