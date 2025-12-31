const API_BASE_URL = "/api";

export const registerUser = async (username: string, pass: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, pass }),
    credentials: "include",
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
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Đăng nhập thất bại");
  }

  const data = await response.json();
  // Chỉ lưu một "dấu hiệu" nhỏ để Frontend biết cần fetch user, không lưu info nhạy cảm
  localStorage.setItem("auth_hint", "true");
  return data;
};

export const logoutAdmin = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
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
