import { http } from "./httpService";

export const registerUser = async (username: string, pass: string) => {
  const response = await http.post("/auth/register", { username, pass });
  return response.data;
};

export const loginAdmin = async (username: string, pass: string) => {
  const response = await http.post("/auth/login", { username, pass });

  // Chỉ lưu một "dấu hiệu" nhỏ để Frontend biết cần fetch user
  localStorage.setItem("auth_hint", "true");
  return response.data;
};

export const logoutAdmin = async () => {
  try {
    await http.post("/auth/logout");
  } catch (e) {
    console.warn("Logout API call failed", e);
  } finally {
    // Clean up everything
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("auth_hint");
  }
};

export const getAuthToken = () => {
  return null; // Token is now in cookie
};

export const getCurrentUser = () => {
  return null; // Should use Redux instead
};

export const isAuthenticated = () => {
  return false; // Should check Redux in components
};

export const isAdmin = () => {
  return false; // Should check Redux in components
};
