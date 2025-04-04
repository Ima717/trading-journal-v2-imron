import DrawdownCard from "../components/DrawdownCard"; // ✅

...

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
  <ChartCard title="Zella Score">
    <ChartZellaScore data={zellaTrendData} />
  </ChartCard>

  <ChartCard title="Equity Curve">
    <ChartEquityCurve data={pnlData} />
  </ChartCard>

  <ChartCard title="Drawdown">
    <DrawdownCard
      maxDrawdown={-842} // 🔧 Replace with actual calculated value
      recoveryFactor={0.65} // 🔧 Replace with real calc
    />
  </ChartCard>
</div>
