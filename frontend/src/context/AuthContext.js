import React, { createContext, useState, useContext, useEffect } from "react";
import { authApi } from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { token: newToken, user: userData } = response.data;

      if (newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
        return true;
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Clear any existing tokens on login failure
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      if (formData.password !== formData.verifyPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await authApi.register(formData);
      return response.data.message;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    token,
    setToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
