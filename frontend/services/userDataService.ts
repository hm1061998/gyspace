import { getAuthToken } from "./authService";
import { Idiom } from "../types";

const API_BASE_URL = "/api/user-data";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

export const toggleSaveIdiom = async (idiomId: string) => {
  const response = await fetch(`${API_BASE_URL}/saved/toggle`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ idiomId }),
  });
  return response.json();
};

export const checkSavedStatus = async (idiomId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/saved/check/${idiomId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) return false;
    return await response.json();
  } catch (e) {
    return false;
  }
};

export const fetchSavedIdioms = async (
  page: number = 1,
  limit: number = 12
): Promise<{ data: Idiom[]; meta: any }> => {
  const response = await fetch(
    `${API_BASE_URL}/saved?page=${page}&limit=${limit}`,
    {
      headers: getHeaders(),
    }
  );
  if (!response.ok) return { data: [], meta: { total: 0, lastPage: 1 } };
  return response.json();
};

export const updateSRSProgress = async (idiomId: string, srsData: any) => {
  const response = await fetch(`${API_BASE_URL}/srs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ idiomId, ...srsData }),
  });
  return response.json();
};

export const fetchSRSData = async (
  page: number = 1,
  limit: number = 100
): Promise<{ data: any[]; meta: any }> => {
  const response = await fetch(
    `${API_BASE_URL}/srs?page=${page}&limit=${limit}`,
    {
      headers: getHeaders(),
    }
  );
  if (!response.ok) return { data: [], meta: { total: 0, lastPage: 1 } };
  return response.json();
};

export const addToHistory = async (idiomId: string) => {
  if (!idiomId) return;
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ idiomId }),
  });
  return response.json();
};

export const fetchHistory = async (
  page: number = 1,
  limit: number = 20
): Promise<{ data: Idiom[]; meta: any }> => {
  const response = await fetch(
    `${API_BASE_URL}/history?page=${page}&limit=${limit}`,
    {
      headers: getHeaders(),
    }
  );
  if (!response.ok) return { data: [], meta: { total: 0, lastPage: 1 } };
  return response.json();
};

export const clearAllHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return response.json();
};
