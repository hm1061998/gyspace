import { http } from "./httpService";
import { Idiom } from "@/types";

const API_BASE_URL = "/user-data";

export const toggleSaveIdiom = async (idiomId: string) => {
  const response = await http.post(`${API_BASE_URL}/saved/toggle`, { idiomId });
  return response.data;
};

export const checkSavedStatus = async (idiomId: string): Promise<boolean> => {
  try {
    const response = await http.get<boolean>(
      `${API_BASE_URL}/saved/check/${idiomId}`
    );
    return response.data;
  } catch (e) {
    return false;
  }
};

export const fetchSavedIdioms = async (
  page: number = 1,
  limit: number = 12
): Promise<{ data: Idiom[]; meta: any }> => {
  try {
    const response = await http.get<{ data: Idiom[]; meta: any }>(
      `${API_BASE_URL}/saved`,
      { page, limit }
    );
    return response.data;
  } catch (e) {
    return { data: [], meta: { total: 0, lastPage: 1 } };
  }
};

export const updateSRSProgress = async (idiomId: string, srsData: any) => {
  const response = await http.post(`${API_BASE_URL}/srs`, {
    idiomId,
    ...srsData,
  });
  return response.data;
};

export const fetchSRSData = async (
  page: number = 1,
  limit: number = 100
): Promise<{ data: any[]; meta: any }> => {
  try {
    const response = await http.get<{ data: any[]; meta: any }>(
      `${API_BASE_URL}/srs`,
      { page, limit }
    );
    return response.data;
  } catch (e) {
    return { data: [], meta: { total: 0, lastPage: 1 } };
  }
};

export const addToHistory = async (idiomId: string) => {
  if (!idiomId) return;
  const response = await http.post(`${API_BASE_URL}/history`, { idiomId });
  return response.data;
};

export const fetchHistory = async (
  page: number = 1,
  limit: number = 20
): Promise<{ data: Idiom[]; meta: any }> => {
  try {
    const response = await http.get<{ data: Idiom[]; meta: any }>(
      `${API_BASE_URL}/history`,
      { page, limit }
    );
    return response.data;
  } catch (e) {
    return { data: [], meta: { total: 0, lastPage: 1 } };
  }
};

export const clearAllHistory = async () => {
  const response = await http.delete(`${API_BASE_URL}/history`);
  return response.data;
};

// USER PROFILE MANAGEMENT
export interface UpdateProfileData {
  displayName: string;
}

export interface ChangePasswordData {
  oldPass: string;
  newPass: string;
}

export const updateProfile = async (data: UpdateProfileData) => {
  const response = await http.put("/user/profile", data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordData) => {
  const response = await http.put("/user/change-password", data);
  return response.data;
};
