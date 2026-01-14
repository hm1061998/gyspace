import { http } from "./httpService";
import { Idiom, QueryParams, PaginatedResponse } from "@/types";

const API_BASE_URL = "/user-data";

export const toggleSaveIdiom = async (idiomId: string) => {
  const response = await http.post(`${API_BASE_URL}/saved/toggle`, { idiomId });
  return response.data;
};

export const checkSavedStatus = async (idiomId: string): Promise<boolean> => {
  try {
    const response = await http.get<{ isSaved: boolean }>(
      `${API_BASE_URL}/saved/check/${idiomId}`
    );
    return !!response.data?.isSaved;
  } catch (e) {
    return false;
  }
};

export const fetchSavedIdioms = async (
  params: QueryParams = {}
): Promise<PaginatedResponse<Idiom>> => {
  try {
    const response = await http.get<PaginatedResponse<Idiom>>(
      `${API_BASE_URL}/saved`,
      { sort: "createdAt,DESC", ...params }
    );
    return response.data;
  } catch (e) {
    return { data: [], meta: { total: 0, lastPage: 1, page: 1, limit: 12 } };
  }
};

export const updateSRSProgress = async (
  idiomId: string,
  srsData: {
    quality?: number;
    interval?: number;
    repetition?: number;
    efactor?: number;
    nextReviewDate?: string;
  }
) => {
  const response = await http.post(`${API_BASE_URL}/srs`, {
    idiomId,
    ...srsData,
  });
  return response.data;
};

export const fetchSRSData = async (
  params: QueryParams = {}
): Promise<PaginatedResponse<any>> => {
  try {
    const response = await http.get<PaginatedResponse<any>>(
      `${API_BASE_URL}/srs`,
      { sort: "createdAt,DESC", ...params }
    );
    return response.data;
  } catch (e) {
    return { data: [], meta: { total: 0, lastPage: 1, page: 1, limit: 12 } };
  }
};

export const addToHistory = async (idiomId: string) => {
  if (!idiomId) return;
  const response = await http.post(`${API_BASE_URL}/history`, { idiomId });
  return response.data;
};

export const fetchHistory = async (
  params: QueryParams = {}
): Promise<PaginatedResponse<Idiom>> => {
  try {
    const response = await http.get<PaginatedResponse<Idiom>>(
      `${API_BASE_URL}/history`,
      { sort: "createdAt,DESC", ...params }
    );
    return response.data;
  } catch (e) {
    return { data: [], meta: { total: 0, lastPage: 1, page: 1, limit: 12 } };
  }
};

export const clearAllHistory = async () => {
  const response = await http.delete(`${API_BASE_URL}/history`);
  return response.data;
};

export const bulkDeleteSavedIdioms = async (idiomIds: string[]) => {
  const response = await http.post(`${API_BASE_URL}/saved/bulk-delete`, {
    idiomIds,
  });
  return response.data;
};

export const bulkDeleteHistory = async (idiomIds: string[]) => {
  const response = await http.post(`${API_BASE_URL}/history/bulk-delete`, {
    idiomIds,
  });
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

export const fetchUserProfile = async () => {
  const response = await http.get<{
    id: string;
    username: string;
    displayName: string;
    xp: number;
    level: number;
    isAdmin: boolean;
  }>("/user/profile");
  return response.data;
};
