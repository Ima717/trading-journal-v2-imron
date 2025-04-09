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
                gradient.addColorStop(0, "rgba(34, 197, 94, 0.9)"); // Green-500
                gradient.addColorStop(1, "rgba(16, 185, 129, 0.7)"); // Emerald-500
                return gradient;
              } else {
                const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(239, 68, 68, 0.9)"); // Red-500
                gradient.addColorStop(1, "rgba(220, 38, 38, 0.7)"); // Red-600
                return gradient;
              }
            },
            borderColor: avgPnLs.map((val) =>
              val >= 0 ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)"
            ),
            borderWidth: 1,
            borderRadius: {
              topLeft: 12,
              topRight: 12,
              bottomLeft: 0,
              bottomRight: 0,
            },
            borderSkipped: false,
            barThickness: 28,
            hoverBackgroundColor: (context) => {
              const value = context.raw;
              const chart = context.chart;
              const { ctx: chartCtx } = chart;
              if (value >= 0) {
                const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(34, 197, 94, 1)");
                gradient.addColorStop(1, "rgba(16, 185, 129, 0.9)");
                return gradient;
              } else {
                const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(239, 68, 68, 1)");
                gradient.addColorStop(1, "rgba(220, 38, 38, 0.9)");
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
              display: false, // Removed "Avg P&L ($)" title
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
      className="flex flex-col md:flex-row gap-4 h-[400px]"
    >
      {filteredTrades && filteredTrades.length > 0 ? (
        <>
          {/* Chart Section */}
          <div className="w-full md:w-[70%] flex items-center justify-center">
            <canvas ref={chartRef} className="w-full h-full drop-shadow-sm" />
          </div>

          {/* Gainer/Loser Section */}
          <div className="w-full md:w-[30%] flex flex-col justify-center gap-4 text-sm">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border-l-4 pl-4 border-green-500 bg-green-50/50 dark:bg-green-900/30 rounded-lg py-4"
            >
              <div className="text-sm uppercase text-green-600 dark:text-green-400 mb-2 tracking-wide font-semibold">
                Top Gainer
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                {topGainer.symbol}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                +${topGainer.pnl.toFixed(2)} avg P&L{" "}
                <span className="whitespace-nowrap">({topGainer.count} trades)</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="border-l-4 pl-4 border-red-500 bg-red-50/50 dark:bg-red-900/30 rounded-lg py-4"
            >
              <div className="text-sm uppercase text-red-600 dark:text-red-400 mb-2 tracking-wide font-semibold">
                Top Loser
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
                {topLoser.symbol}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                -${Math.abs(topLoser.pnl).toFixed(2)} avg P&L{" "}
                <span className="whitespace-nowrap">({topLoser.count} trades)</span>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400 text-sm font-medium">
          No trades available to display.
        </div>
      )}
    </motion.div>
  );
};

export default ChartPnLBySymbol;
