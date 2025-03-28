// /src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import EditTrade from "./pages/EditTrade";
import { AuthProvider } from "./context/AuthContext";
import Test from "./pages/Test";
import ImportTrades from "./pages/ImportTrades";
import CalendarPage from "./pages/CalendarPage";
import { FilterProvider } from "./context/FilterContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <FilterProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/test" element={<Test />} />
            <Route path="/import" element={<ImportTrades />} />
            <Route path="/calendar" element={<CalendarPage />} />

            {/* Dashboard is now public for dev access */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-trade" element={<AddTrade />} />
            <Route path="/edit-trade/:id" element={<EditTrade />} />
          </Routes>
        </FilterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
