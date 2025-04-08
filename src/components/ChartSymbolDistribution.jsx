import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useFilters } from "../context/FilterContext";
import { motion } from "framer-motion";

const ChartSymbolDistribution = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { filteredTrades } = useFilters();

  const [totalTrades, setTotalTrades] = useState(0);
  const [topSymbol, setTopSymbol] = useState("N/A");
  const [topCount, setTopCount] = useState(0);

  useEffect(() => {
    if (!filteredTrades || filteredTrades.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const getBaseSymbol = (symbol) => {
      const match = symbol.match(/^([A-Z]+)([0-9]{6}[CP][0-9]+)$/);
      return match ? match[1] : symbol;
    };

    const tradeCounts = {};
    filteredTrades.forEach((trade) => {
      const baseSymbol = getBaseSymbol(trade.symbol || "Unknown");
      tradeCounts[baseSymbol] = (tradeCounts[baseSymbol] || 0) + 1;
    });

    // Update summary state
    const entries = Object.entries(tradeCounts);
    const [top, count] = entries.reduce(
      (acc, [symbol, cnt]) => (cnt > acc[1] ? [symbol, cnt] : acc),
      ["N/A", 0]
    );

    setTopSymbol(top);
    setTopCount(count);
    setTotalTrades(filteredTrades.length);

    const labels = Object.keys(tradeCounts);
    const data = Object.values(tradeCounts);

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Trades",
            data,
            backgroundColor: (ctx) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, "#3b82f6");
              gradient.addColorStop(1, "#22d3ee");
              return gradient;
            },
            borderRadius: 12,
            barThickness: 26,
            borderSkipped: false,
            hoverBackgroundColor: "#2563eb",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeOutCubic",
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1f2937",
            cornerRadius: 8,
            titleColor: "#fff",
            bodyColor: "#d1d5db",
            borderColor: "#3b82f6",
            borderWidth: 1,
            titleFont: { size: 13, weight: "600", family: "Inter" },
            bodyFont: { size: 12, family: "Inter" },
            callbacks: {
              label: (ctx) => `${ctx.raw} trades`,
              title: (items) => `Symbol: ${items[0].label}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#9ca3af",
              font: { size: 12, family: "Inter" },
              padding: 6,
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#9ca3af",
              stepSize: 1,
              font: { size: 12, family: "Inter" },
            },
            grid: {
              color: "rgba(255,255,255,0.04)",
              drawTicks: false,
              borderDash: [3, 3],
            },
          },
        },
      },
    });

    return () => chartInstanceRef.current?.destroy();
  }, [filteredTrades]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-[400px] w-full relative"
    >
      {filteredTrades && filteredTrades.length > 0 ? (
        <>
          <canvas ref={chartRef} className="drop-shadow-md" />
          <div className="mt-4 flex justify-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Total Trades:</span>
              <span className="text-blue-500 dark:text-blue-400 font-semibold">{totalTrades}</span>
            </div>
            <div className="w-[1px] bg-gray-300 dark:bg-gray-700 h-4 self-center" />
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Top Symbol:</span>
              <span className="text-blue-500 dark:text-blue-400 font-semibold">{topSymbol}</span>
              <span className="text-gray-400">({topCount} trades)</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm font-medium">
          No trades available to display.
        </div>
      )}
    </motion.div>
  );
};

export default ChartSymbolDistribution;
