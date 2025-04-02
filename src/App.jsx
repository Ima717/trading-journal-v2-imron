import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import EditTrade from "./pages/EditTrade";
import Trades from "./pages/Trades";
import Test from "./pages/Test";
import ImportTrades from "./pages/ImportTrades";
import { AuthProvider } from "./context/AuthContext";
import { FilterProvider } from "./context/FilterContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./layouts/MainLayout"; // 👈 Import the layout

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

              {/* Protected layout */}
              <Route element={<MainLayout />}>
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
