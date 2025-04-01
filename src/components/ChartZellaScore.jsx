// ChartZellaScore.jsx – Line chart for Zella Score over time

import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const ChartZellaScore = ({ data }) => {
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
            label: "Zella Score",
            data: data.map((d) => d.zellaScore),
            borderColor: "#6366f1", // Indigo-500
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
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
              color: "#6b7280",
            },
            ticks: {
              color: "#6b7280",
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Zella Score",
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
              label: (context) => `Zella Score: ${context.raw.toFixed(2)}`,
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
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
      <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3">Zella Score Over Time</h3>
      <div className="h-[400px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default ChartZellaScore;
