import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 🔧 MOCKED user object for development
  const [user, setUser] = useState({
    uid: "mocked-user-id",
    email: "demo@imai.app",
  });

  // Future: wire in actual Firebase auth logic here

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
