import React, { createContext, useState, useEffect, ReactNode } from "react";
import { isLoggedIn, getToken, logout, logoutAndRedirect } from "../utilites/auth";
import { getProfile } from "../services/authService";
import { User } from "../types/user";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginUser: (token: string) => Promise<void>;
  logoutUser: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoggedIn()) {
        try {
          const res = await getProfile();
          console.log("Profile loaded:", res.data);
          setUser(res.data);
        } catch (err) {
          console.error("Failed to fetch profile, clearing user state:", err);
          // Don't redirect on API errors, just clear user state
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const loginUser = async (token: string) => {
    console.log("loginUser called with token:", token);
    localStorage.setItem("token", token); // кладем токен
    try {
      const res = await getProfile();
      console.log("Profile after login:", res.data);
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch profile after login:", err);
      // Don't redirect on API errors, just clear user state
      setUser(null);
    }
  };

  const logoutUser = () => {
    console.log("logoutUser called");
    logout();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
