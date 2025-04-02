import React, { useState } from "react";
import TradeTable from "./TradeTable";

const TradeTabs = ({ filteredTrades }) => {
  const [activeTab, setActiveTab] = useState("recent");

  const tabs = [
    { key: "recent", label: "Recent Trades" },
    { key: "open", label: "Open Positions" },
    { key: "summary", label: "Account Summary" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "recent":
        return <TradeTable trades={filteredTrades} />;
      case "open":
        return <p className="text-gray-600 dark:text-gray-300">No open positions yet.</p>;
      case "summary":
        return <p className="text-gray-600 dark:text-gray-300">Summary data coming soon...</p>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
      <div className="flex border-b border-gray-200 dark:border-zinc-700 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`mr-4 pb-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {renderContent()}
      </div>
    </div>
  );
};

export default TradeTabs;
