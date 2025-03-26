import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Test from './pages/Test';
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

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-trade"
              element={
                <PrivateRoute>
                  <AddTrade />
                </PrivateRoute>
              }
            />
          </Routes>
        </FilterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
