import { createContext, useState, useEffect, type ReactNode } from "react";
import { isLoggedIn, logout } from "../utilites/auth";
import { getProfile } from "../services/authService";
import { User } from "../types/user";
import { fetchFavouriteProductIds } from "../api/favourites";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginUser: (token: string) => Promise<void>;
  logoutUser: () => void;
  favouriteProductIds: Set<number>;
  addFavouriteId: (productId: number) => void;
  removeFavouriteId: (productId: number) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favouriteProductIds, setFavouriteProductIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoggedIn()) {
        try {
          const res = await getProfile();
          console.log("Profile loaded:", res.data);
          setUser(res.data);
          // Load favourite product IDs for fast is-fav checks
          try {
            const ids = await fetchFavouriteProductIds();
            setFavouriteProductIds(new Set(ids));
          } catch (e) {
            console.warn("Failed to fetch favourite product IDs on init:", e);
            setFavouriteProductIds(new Set());
          }
        } catch (err) {
          console.error("Failed to fetch profile, clearing user state:", err);
          // Don't redirect on API errors, just clear user state
          setUser(null);
          setFavouriteProductIds(new Set());
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
      try {
        const ids = await fetchFavouriteProductIds();
        setFavouriteProductIds(new Set(ids));
      } catch (e) {
        console.warn("Failed to fetch favourite product IDs after login:", e);
        setFavouriteProductIds(new Set());
      }
    } catch (err) {
      console.error("Failed to fetch profile after login:", err);
      // Don't redirect on API errors, just clear user state
      setUser(null);
      setFavouriteProductIds(new Set());
    }
  };

  const logoutUser = () => {
    console.log("logoutUser called");
    logout();
    setUser(null);
    setFavouriteProductIds(new Set());
    window.location.href = "/login";
  };

  const addFavouriteId = (productId: number) => {
    setFavouriteProductIds((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  };

  const removeFavouriteId = (productId: number) => {
    setFavouriteProductIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, favouriteProductIds, addFavouriteId, removeFavouriteId }}>
      {children}
    </AuthContext.Provider>
  );
};
