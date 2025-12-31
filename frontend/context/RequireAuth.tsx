import React from "react";
import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const RequireAuth = () => {
  const { user } = useAuth();
  const outlet = useOutlet();

  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  // Otherwise, render the child routes/components (Outlet)
  return outlet;
};

export default RequireAuth;
