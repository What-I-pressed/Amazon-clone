import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const auth = useContext(AuthContext);

  if (!auth) return null; // контекст не підключений — можливо рендер до проавйдера

  if (auth.loading) {
    return <div>Загрузка...</div>;
  }

  return auth.user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
