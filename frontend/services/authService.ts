const API_BASE_URL = "/api";

export const registerUser = async (username: string, pass: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, pass }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Đăng ký thất bại");
  }
  return await response.json();
};

export const loginAdmin = async (username: string, pass: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, pass }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Đăng nhập thất bại");
  }

  const data = await response.json();
  localStorage.setItem("admin_token", data.access_token);
  localStorage.setItem("admin_user", JSON.stringify(data.user));
  return data;
};

export const logoutAdmin = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
};

export const getAuthToken = () => {
  return localStorage.getItem("admin_token");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("admin_user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("admin_token");
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.isAdmin || false;
};
