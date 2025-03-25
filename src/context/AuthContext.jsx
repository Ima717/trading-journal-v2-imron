import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../utils/firebase'; // Assuming you exported firebase auth from firebase.js
import { onAuthStateChanged } from 'firebase/auth'; // For listening to auth state changes

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set the user state when the auth state changes
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext in any component
export const useAuth = () => {
  return useContext(AuthContext);
};
