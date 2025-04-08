import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useFilters } from "../context/FilterContext";

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
      // Match option symbols like TSLA250328C800, AAPL250321P145
      const match = symbol.match(/^([A-Z]+)([0-9]{6}[CP][0-9]+)$/);
      return match ? match[1] : symbol; // Return base symbol (e.g., TSLA) or original symbol if not an option
    };

    // Group trades by base symbol
    const tradeCounts = {};
    filteredTrades.forEach((trade) => {
      const baseSymbol = getBaseSymbol(trade.symbol || "Unknown");
      tradeCounts[baseSymbol] = (tradeCounts[baseSymbol] || 0) + 1;
    });

    const labels = Object.keys(tradeCounts);
    const data = Object.values(tradeCounts);

    // Generate colors for each bar
    const backgroundColors = labels.map((_, index) => {
      const hue = (index * 137.5) % 360; // Golden angle approximation for distinct colors
      return `hsla(${hue}, 70%, 60%, 0.6)`;
    });
    const borderColors = labels.map((_, index) => {
      const hue = (index * 137.5) % 360;
      return `hsla(${hue}, 70%, 60%, 1)`;
    });

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
            barThickness: 30,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { size: 14, weight: "bold" },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
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
              color: "#6b7280",
              font: { size: 14, weight: "bold" },
              padding: { top: 10 },
            },
            ticks: {
              color: "#6b7280",
              font: { size: 12 },
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Trade Count",
              color: "#6b7280",
              font: { size: 14, weight: "bold" },
              padding: { bottom: 10 },
            },
            ticks: {
              color: "#6b7280",
              font: { size: 12 },
              stepSize: 1,
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
              drawBorder: false,
            },
          },
        },
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
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
    <div className="h-[400px]">
      {filteredTrades && filteredTrades.length > 0 ? (
        <canvas ref={chartRef} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
          No trades available to display.
        </div>
      )}
    </div>
  );
};

export default ChartSymbolDistribution;
