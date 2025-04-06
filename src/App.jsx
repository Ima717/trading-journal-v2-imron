import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import EditTrade from "./pages/EditTrade";
import Trades from "./pages/Trades";
import Test from "./pages/Test";
import ImportTrades from "./pages/ImportTrades";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FilterProvider } from "./context/FilterContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./layouts/MainLayout";

// ProtectedRoute component to check if user is signed in
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <FilterProvider>
          <ThemeProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/test" element={<Test />} />

              {/* Protected routes under MainLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-trade" element={<AddTrade />} />
                <Route path="/edit-trade/:id" element={<EditTrade />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/import" element={<ImportTrades />} />
              </Route>
            </Routes>
          </ThemeProvider>
        </FilterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
