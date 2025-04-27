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
import AccountPage from "./pages/AccountPage"; // <-- 1. Import the new page component
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FilterProvider } from "./context/FilterContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./layouts/MainLayout"; // Assuming MainLayout is in layouts folder

// ProtectedRoute component to check if user is signed in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Added loading check as good practice

  // Optional: Show loading state while auth status is being determined
  if (loading) {
      // You might want a more sophisticated loading indicator here
      return <div>Loading application...</div>;
  }

  return user ? children : <Navigate to="/signin" replace />; // Added replace prop
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
              <Route path="/test" element={<Test />} /> {/* Consider if this should be protected */}

              {/* Protected routes rendered within MainLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                {/* These routes will render inside MainLayout's <Outlet> */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-trade" element={<AddTrade />} />
                <Route path="/edit-trade/:id" element={<EditTrade />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/import" element={<ImportTrades />} />
                {/* --- 2. Add the route for AccountPage --- */}
                <Route path="/account" element={<AccountPage />} />
                {/* --- End of added route --- */}

                {/* TODO: Add routes for other pages linked in Sidebar if not already present */}
                {/* e.g., <Route path="/journal" element={<JournalPage />} /> */}
                {/* <Route path="/notebook" element={<NotebookPage />} /> */}
                {/* <Route path="/playbooks" element={<PlaybooksPage />} /> */}
                {/* <Route path="/progress" element={<ProgressPage />} /> */}

              </Route> {/* End of Protected Routes group */}

               {/* Optional: Add a 404 Not Found route */}
               {/* <Route path="*" element={<NotFoundPage />} /> */}

            </Routes>
          </ThemeProvider>
        </FilterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
