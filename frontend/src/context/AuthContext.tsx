import { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getProfile } from "../services/authService";
import { User } from "../types/user";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  favouriteProductIds: Set<number>;
  loginUser: (token: string) => Promise<void>;
  logoutUser: () => void;
  addFavouriteId: (productId: number) => void;
  removeFavouriteId: (productId: number) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [favouriteProductIds, setFavouriteProductIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const fetchAndStoreProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setUser(response.data ?? null);
      const ids = (response.data?.favouriteProductIds ?? []) as Array<number | string>;
      setFavouriteProductIds(new Set(ids.map((id) => Number(id))));
    } catch (error) {
      setUser(null);
      setFavouriteProductIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndStoreProfile();
  }, [fetchAndStoreProfile]);

  const loginUser = async (token: string) => {
    localStorage.setItem("token", token);
    await fetchAndStoreProfile();
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
    setFavouriteProductIds(new Set());
  };

  const addFavouriteId = (productId: number) => {
    setFavouriteProductIds((prev) => {
      const next = new Set(prev);
      next.add(Number(productId));
      return next;
    });
  };

  const removeFavouriteId = (productId: number) => {
    setFavouriteProductIds((prev) => {
      const next = new Set(prev);
      next.delete(Number(productId));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        favouriteProductIds,
        loginUser,
        logoutUser,
        addFavouriteId,
        removeFavouriteId,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
