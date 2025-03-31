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
            borderColor: "#007bff", // TradeZella's blue
            backgroundColor: "rgba(0, 123, 255, 0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
              color: "#6b7280", // text-gray-600
            },
            ticks: {
              color: "#6b7280",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "P&L ($)",
              color: "#6b7280",
            },
            ticks: {
              color: "#6b7280",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-sm text-gray-600 mb-3">P&L Over Time</h3>
      <div className="h-[400px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default PerformanceChart;
