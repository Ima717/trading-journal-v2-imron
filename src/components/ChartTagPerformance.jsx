// /src/components/ChartTagPerformance.jsx
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
        labels: labels,
        datasets: [
          {
            label: "Avg PnL by Tag",
            data: avgPnLs,
            backgroundColor: avgPnLs.map((pnl) =>
              pnl >= 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"
            ),
            borderColor: avgPnLs.map((pnl) =>
              pnl >= 0 ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)"
            ),
            borderWidth: 1,
            hoverBackgroundColor: avgPnLs.map((pnl) =>
              pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
            ),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Avg PnL ($)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Tags",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => `Avg PnL: $${context.raw.toFixed(2)}`,
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
          event.native.target.style.cursor = elements.length > 0 ? "pointer" : "default";
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
    <div className="bg-white shadow rounded-xl p-4">
      <h3 className="text-sm text-gray-600 mb-3">📈 Tag Performance</h3>
      <div className="h-40"> {/* Reduced from h-48 to h-40 */}
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default ChartTagPerformance;
