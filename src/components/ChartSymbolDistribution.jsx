import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useFilters } from "../context/FilterContext";
import { motion } from "framer-motion";

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

    // Function to extract base symbol from option symbols
    const getBaseSymbol = (symbol) => {
      const match = symbol.match(/^([A-Z]+)([0-9]{6}[CP][0-9]+)$/);
      return match ? match[1] : symbol;
    };

    // Group trades by base symbol
    const tradeCounts = {};
    filteredTrades.forEach((trade) => {
      const baseSymbol = getBaseSymbol(trade.symbol || "Unknown");
      tradeCounts[baseSymbol] = (tradeCounts[baseSymbol] || 0) + 1;
    });

    const labels = Object.keys(tradeCounts);
    const data = Object.values(tradeCounts);

    // Premium color scheme (gradient from blue to teal)
    const backgroundColors = labels.map(() =>
      ctx.createLinearGradient(0, 0, 0, 400)
        .addColorStop(0, "rgba(59, 130, 246, 0.8)")
        .addColorStop(1, "rgba(34, 211, 238, 0.6)")
    );
    const borderColors = labels.map(() => "rgba(59, 130, 246, 1)");
    const hoverBackgroundColors = labels.map(() =>
      ctx.createLinearGradient(0, 0, 0, 400)
        .addColorStop(0, "rgba(59, 130, 246, 1)")
        .addColorStop(1, "rgba(34, 211, 238, 0.9)")
    );

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Trades per Symbol",
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
            borderRadius: 8, // Rounded corners for bars
            barThickness: 24, // Slimmer bars for a modern look
            hoverBackgroundColor: hoverBackgroundColors,
            hoverBorderColor: "rgba(59, 130, 246, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(17, 24, 39, 0.95)", // Dark background with slight transparency
            titleFont: { size: 14, weight: "bold", family: "'Inter', sans-serif" },
            bodyFont: { size: 12, family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 8,
            boxPadding: 4,
            caretSize: 6,
            borderColor: "rgba(59, 130, 246, 0.3)",
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `${ctx.raw} trades`,
              title: (tooltipItems) => `Symbol: ${tooltipItems[0].label}`,
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Symbol",
              color: "#9ca3af", // Gray-400
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
              text: "Trade Count",
              color: "#9ca3af",
              font: { size: 14, weight: "600", family: "'Inter', sans-serif" },
              padding: { bottom: 10 },
            },
            ticks: {
              color: "#9ca3af",
              font: { size: 12, family: "'Inter', sans-serif" },
              stepSize: 1,
              padding: 8,
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
          onComplete: () => {
            // Add subtle glow effect on complete
            chartInstanceRef.current.data.datasets[0].backgroundColor = backgroundColors;
            chartInstanceRef.current.update();
          },
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
      className="h-[400px] relative"
    >
      {filteredTrades && filteredTrades.length > 0 ? (
        <canvas ref={chartRef} className="drop-shadow-sm" />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm font-medium">
          No trades available to display.
        </div>
      )}
    </motion.div>
  );
};

export default ChartSymbolDistribution;
