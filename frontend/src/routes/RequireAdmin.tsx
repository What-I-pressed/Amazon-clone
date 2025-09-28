import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getProfile } from "../services/authService";
import { getToken } from "../utilites/auth";

const RequireAdmin: React.FC = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const evaluateFromContext = () => {
      if (!auth) return false;
      if (auth.loading) {
        setChecking(true);
        return true;
      }
      if (cancelled) return true;

      const role = String(auth.user?.roleName ?? "").toUpperCase();
      setIsLoggedIn(auth.isAuthenticated);
      setIsAdmin(auth.isAuthenticated && role === "ADMIN");
      setChecking(false);
      return true;
    };

    const evaluateManually = async () => {
      setChecking(true);
      const token = getToken();
      if (!token) {
        if (!cancelled) {
          setIsLoggedIn(false);
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }

      try {
        const response = await getProfile();
        if (cancelled) return;
        const role = String(response.data?.roleName ?? "").toUpperCase();
        setIsLoggedIn(true);
        setIsAdmin(role === "ADMIN");
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    const handledByContext = evaluateFromContext();
    if (!handledByContext) {
      void evaluateManually();
    }

    return () => {
      cancelled = true;
    };
  }, [auth?.loading, auth?.isAuthenticated, auth?.user]);

  if (checking) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="inline-flex items-center gap-2 text-[#585858]">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#454545]" />
          <span>Checking access...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
