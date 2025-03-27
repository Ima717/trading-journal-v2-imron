// /src/pages/Dashboard.jsx

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    dateRange,
    setDateRange,
    resultFilter,
    setResultFilter,
    tagSearchTerm,
    setTagSearchTerm,
    filterTrades,
  } = useFilters();

  const [tagPerformanceData, setTagPerformanceData] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [clickedTag, setClickedTag] = useState(null);

  const tradeTableRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatDateRange = () => {
    if (!dateRange.start || !dateRange.end) return "Showing all data";
    const start = dayjs(dateRange.start).format("MMM D");
    const end = dayjs(dateRange.end).format("MMM D");
    return start === end
      ? `Showing trades for ${start}`
      : `Showing trades from ${start} to ${end}`;
  };

  useEffect(() => {
    const fetchTagPerformance = async () => {
      if (!user) return;

      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const trades = snapshot.docs.map((doc) => doc.data());

      const filtered = filterTrades(trades);
      setFilteredTrades(filtered);

      const pnlSeries = getPnLOverTime(filtered);
      setPnlData(pnlSeries);

      const tagMap = {};
      filtered.forEach((trade) => {
        if (Array.isArray(trade.tags)) {
          trade.tags.forEach((tag) => {
            if (!tagMap[tag]) tagMap[tag] = { totalPnL: 0, count: 0 };
            tagMap[tag].totalPnL += trade.pnl || 0;
            tagMap[tag].count += 1;
          });
        }
      });

      const formatted = Object.entries(tagMap).map(([tag, val]) => ({
        tag,
        avgPnL: parseFloat((val.totalPnL / val.count).toFixed(2)),
      }));

      setTagPerformanceData(formatted);
    };

    fetchTagPerformance();
  }, [user, dateRange, resultFilter, tagSearchTerm, clickedTag]);

  const handleTagClick = (tag) => {
    setClickedTag(tag);
    setTagSearchTerm("");
    setResultFilter("all");
    tradeTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Calculate the values dynamically for the widgets
  const totalTrades = filteredTrades.length || 0;
  const winRate = totalTrades
    ? (filteredTrades.filter((t) => t.result === "Win").length / totalTrades) * 100
    : 0;
  const totalPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-zinc-800 mb-2 sm:mb-0">📊 Welcome to IMAI Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/add-trade" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">➕ Add Trade</Link>
          <Link to="/import" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">📤 Import Trades</Link>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">🔒 Log Out</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <DashboardSidebar />
        </div>

        <div className="lg:col-span-3 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Trades</h3>
              <p className="text-2xl font-bold text-gray-900">{totalTrades}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Win Rate</h3>
              <p className="text-2xl font-bold text-gray-900">{winRate.toFixed(2)}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total PnL</h3>
              <p className="text-2xl font-bold text-gray-900">${totalPnL.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-between items-end mb-6">
            <ResultFilter />
            <SearchFilter
              searchTerm={tagSearchTerm}
              onSearchChange={(term) => setTagSearchTerm(term)}
              selectedTag={clickedTag}
              onClear={() => {
                setTagSearchTerm("");
                setClickedTag(null);
              }}
            />
            <div className="text-sm text-gray-600">
              <p>{formatDateRange()}</p>
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={() => setDateRange({ start: null, end: null })}
                  className="underline text-blue-600 hover:text-blue-800"
                >
                  Reset Date Filter ✕
                </button>
              )}
            </div>
          </div>

          {/* Analytics Overview */}
          <AnalyticsOverview />

          {/* PnL Chart */}
          {pnlData.length > 0 && <PerformanceChart data={pnlData} />}

          {/* Tag Performance Chart */}
          {tagPerformanceData.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">📈 Tag Performance</h2>
              <ChartTagPerformance data={tagPerformanceData} onTagClick={handleTagClick} />
              {clickedTag && filteredTrades.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  No trades found for tag "<span className="font-semibold">{clickedTag}</span>" with current filters.
                </p>
              )}
            </div>
          )}

          {/* Trade Table */}
          <div ref={tradeTableRef}>
            <TradeTable trades={filteredTrades} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
