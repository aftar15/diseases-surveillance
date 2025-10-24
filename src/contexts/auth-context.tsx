"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("auth_token");
      const savedUserData = localStorage.getItem("user_data");
      
      // If there's a token, verify it with the server
      if (savedToken) {
        try {
          const isValid = await verifyToken(savedToken);
          if (isValid) {
            // Token is valid, set the auth state
            setToken(savedToken);
            if (savedUserData) {
              try {
                setUser(JSON.parse(savedUserData));
              } catch (e) {
                console.error("Failed to parse saved user data:", e);
                localStorage.removeItem("user_data");
              }
            }
          } else {
            // If token is invalid, clear everything
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          // On error, clear everything
          console.error("Token verification failed:", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          setToken(null);
          setUser(null);
        }
      } else {
        // No token found, ensure state is clean
        setToken(null);
        setUser(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Function to log in
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      // Save token and user data
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setToken(null);
    setUser(null);
  };

  // Verify token with server
  const verifyToken = async (tkn: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/verify", {
        headers: {
          "Authorization": `Bearer ${tkn}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.isValid) {
        return false;
      }
      
      // Update user data from the server
      setUser(data.user);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      
      return true;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 