import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const PerformanceChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.date),
        datasets: [
          {
            label: "P&L Over Time",
            data: data.map((d) => d.pnl),
            borderColor: "#3b82f6", // Primary color
            backgroundColor: "rgba(59, 130, 246, 0.15)", // Lighter background for the line
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: "easeOutQuart",
        },
        scales: {
          x: {
            ticks: {
              color: "#6b7280",
              font: { family: "Inter", size: 12 },
            },
            title: {
              display: true,
              text: "Date",
              color: "#9ca3af",
              font: { family: "Inter", weight: "bold" },
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: false,
            ticks: {
              color: "#6b7280",
              font: { family: "Inter", size: 12 },
            },
            title: {
              display: true,
              text: "P&L ($)",
              color: "#9ca3af",
              font: { family: "Inter", weight: "bold" },
            },
            grid: {
              color: "#e5e7eb",
              borderDash: [3, 3],
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1f2937", // Dark background for tooltip
            titleColor: "#f9fafb", // White text for title
            bodyColor: "#f9fafb", // White text for body
            padding: 12,
            borderColor: "#3b82f6", // Blue border for the tooltip
            borderWidth: 1.5,
            cornerRadius: 6, // Rounded corners for the tooltip
            callbacks: {
              label: (context) => `P&L: $${context.raw.toFixed(2)}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-semibold">
        📈 P&L Over Time
      </h3>
      <div className="h-[400px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default PerformanceChart;
