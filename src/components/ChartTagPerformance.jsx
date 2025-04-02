import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const ChartTagPerformance = ({ data, onTagClick }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = data.map((item) => item.tag);
    const avgPnLs = data.map((item) => item.avgPnL);

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Avg P&L by Tag",
            data: avgPnLs,
            backgroundColor: avgPnLs.map((pnl) =>
              pnl >= 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"
            ),
            borderColor: avgPnLs.map((pnl) =>
              pnl >= 0 ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)"
            ),
            borderWidth: 1.5,
            hoverBackgroundColor: avgPnLs.map((pnl) =>
              pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
            ),
            barThickness: 24,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 700,
          easing: "easeOutQuart",
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
            ticks: {
              color: "#6b7280",
              font: { family: "Inter" },
            },
            grid: {
              color: "#e5e7eb",
              borderDash: [3, 3],
            },
          },
          x: {
            title: {
              display: true,
              text: "Tags",
              color: "#6b7280",
              font: { weight: "bold", family: "Inter" },
            },
            ticks: {
              color: "#6b7280",
              font: { family: "Inter" },
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1f2937",
            titleColor: "#f9fafb",
            bodyColor: "#f9fafb",
            padding: 10,
            borderColor: "#10b981",
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `Avg P&L: $${ctx.raw.toFixed(2)}`,
              title: (items) => `Tag: ${items[0].label}`,
            },
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const tag = labels[index];
            onTagClick(tag);
          }
        },
        onHover: (event, elements) => {
          event.native.target.style.cursor =
            elements.length > 0 ? "pointer" : "default";
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, onTagClick]);

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-semibold">
        🏷️ Tag Performance
      </h3>
      <div className="h-[400px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default ChartTagPerformance;
