import { getCurrentUser } from "@/services/authService";
import React, { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // In a real app, state might be synced with localStorage or an API call
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();

  const login = async (userData) => {
    // Authenticate with backend API here
    setUser(userData);
    navigate("/"); // Redirect to a protected page on success
  };

  const logout = () => {
    setUser(null);
    navigate("/", { replace: true }); // Redirect to home/login page
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
