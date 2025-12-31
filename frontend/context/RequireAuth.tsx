import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAdmin } from "../services/authService";

const RequireAuth = () => {
  // Check trực tiếp từ localStorage để đảm bảo tính thời gian thực ngay sau khi login
  // Tránh việc phụ thuộc vào Context State chưa được cập nhật kịp
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
