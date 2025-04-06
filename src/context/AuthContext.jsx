import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../utils/firebase"; // Ensure path matches your setup

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Start with null (not logged in)
  const [loading, setLoading] = useState(true); // Loading state for auth check

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Set real user or null if not logged in
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {!loading ? children : <div>Loading...</div>} {/* Wait for auth check */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
