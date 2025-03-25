return (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">
          📊 Welcome to IMAI Dashboard
        </h1>

        {/* Button Group */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/calendar"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow"
          >
            📅 Calendar
          </Link>

          <Link
            to="/add-trade"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
          >
            ➕ Add Trade
          </Link>

          <Link
            to="/test"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            🧪 Test
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
          >
            🔒 Log Out
          </button>
        </div>
      </div>

      {/* Analytics & Trade Table */}
      <AnalyticsOverview />
      <TradeTable />
    </div>
  </div>
);
