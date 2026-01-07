import { http } from "./httpService";

export const listUsers = async (
  params: { page?: number; limit?: number; search?: string } = {}
) => {
  const response = await http.get("/user/list", params);
  return response.data;
};

export const adminCreateUser = async (data: {
  username: string;
  pass: string;
  isAdmin?: boolean;
  displayName?: string;
}) => {
  const response = await http.post("/user/admin-create", data);
  return response.data;
};

export const resetUserPassword = async (id: string, newPass: string) => {
  const response = await http.put(`/user/${id}/reset-password`, { newPass });
  return response.data;
};

export const revokeUserSession = async (id: string) => {
  const response = await http.post(`/user/${id}/revoke-session`, {});
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await http.delete(`/user/${id}`);
  return response.data;
};
