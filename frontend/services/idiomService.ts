import { Idiom, SearchMode } from "../types";
import {
  TABLE_IDIOMS,
  TABLE_CHARACTER_ANALYSIS,
  TABLE_EXAMPLES,
} from "../data/database";
import { getAuthToken } from "./authService";

const getEnv = (key: string) => {
  if ((import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return null;
};

const getHeaders = (isJson = true) => {
  const headers: any = {};
  if (isJson) headers["Content-Type"] = "application/json";

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const API_BASE_URL = "/api";

// Hàm hỗ trợ lưu LocalStorage (Dùng cho Fallback và Offline Mode)
const saveLocalIdiom = (data: any) => {
  try {
    const stored = localStorage.getItem("custom_idioms");
    const customIdioms = stored ? JSON.parse(stored) : [];

    // Kiểm tra trùng lặp
    if (customIdioms.some((i: any) => i.hanzi === data.hanzi)) {
      throw new Error(`Từ "${data.hanzi}" đã tồn tại trong bộ nhớ máy.`);
    }

    const newIdiom = {
      ...data,
      id: `local_${Date.now()}`,
      dataSource: "local",
    };

    customIdioms.push(newIdiom);
    localStorage.setItem("custom_idioms", JSON.stringify(customIdioms));

    return newIdiom;
  } catch (localError: any) {
    throw new Error(localError.message || "Không thể lưu dữ liệu.");
  }
};

const searchLocalDatabase = (query: string) => {
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Tìm trong dữ liệu tĩnh (Static Database)
  let result: any = null;
  const staticIdiom = TABLE_IDIOMS.find(
    (i) =>
      i.hanzi === normalizedQuery ||
      i.pinyin.toLowerCase().includes(normalizedQuery) ||
      i.vietnameseMeaning.toLowerCase().includes(normalizedQuery)
  );

  if (staticIdiom) {
    const analysis = TABLE_CHARACTER_ANALYSIS.filter(
      (a) => a.idiomId === staticIdiom.id
    ).map(({ id, idiomId, ...rest }) => rest);

    const examples = TABLE_EXAMPLES.filter(
      (e) => e.idiomId === staticIdiom.id
    ).map(({ id, idiomId, ...rest }) => rest);

    result = { ...staticIdiom, analysis, examples, dataSource: "database" };
  }
  return result;
};

export const fetchAdminStats = async () => {
  // Nếu chưa login, trả về object rỗng thay vì gọi API
  if (!getAuthToken()) return {};

  try {
    const response = await fetch(`${API_BASE_URL}/idioms/admin/stats`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Không thể tải thống kê.");
    return await response.json();
  } catch (error) {
    console.error("Stats error:", error);
    throw error;
  }
};

export const fetchIdiomDetails = async (
  query: string,
  mode: SearchMode = "database"
): Promise<Idiom & { dataSource: string }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(
      `${API_BASE_URL}/idioms/search?query=${encodeURIComponent(
        query
      )}&mode=${mode}`,
      {
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi server.");
      }
      return await response.json();
    } else {
      throw new Error("Backend not available");
    }
  } catch (error: any) {
    console.warn(
      "Kết nối Backend thất bại, chuyển sang chế độ Client-side Fallback:",
      error.message
    );
    const localResult = searchLocalDatabase(query);
    if (localResult) {
      return localResult;
    }
    throw new Error(error);
  }
};

export const fetchIdiomById = async (id: string): Promise<Idiom> => {
  try {
    const response = await fetch(`${API_BASE_URL}/idioms/${id}`);
    if (!response.ok) throw new Error("Không thể tải thông tin từ vựng.");
    return await response.json();
  } catch (error: any) {
    console.error("Fetch ID error:", error);
    throw error;
  }
};

export const createIdiom = async (data: any) => {
  // Nếu chưa login, lưu trực tiếp vào LocalStorage (Offline mode)
  if (!getAuthToken()) {
    console.warn("No token, saving to LocalStorage directly.");
    return saveLocalIdiom(data);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/idioms`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Lỗi backend.");
    }

    return await response.json();
  } catch (error: any) {
    console.warn(
      "Backend create failed or timeout, saving to LocalStorage.",
      error
    );
    return saveLocalIdiom(data);
  }
};

export const bulkCreateIdioms = async (data: any[]) => {
  if (!getAuthToken()) return {}; // Silent return
  const response = await fetch(`${API_BASE_URL}/idioms/bulk`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Lỗi khi import hàng loạt.");
  return await response.json();
};

export const updateIdiom = async (id: string, data: any) => {
  if (!getAuthToken()) return {}; // Silent return
  try {
    const response = await fetch(`${API_BASE_URL}/idioms/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Lỗi khi cập nhật.");
    }
    return await response.json();
  } catch (error: any) {
    console.error("Update error:", error);
    throw error;
  }
};

export const deleteIdiom = async (id: string) => {
  if (!getAuthToken()) return {}; // Silent return
  const response = await fetch(`${API_BASE_URL}/idioms/${id}`, {
    method: "DELETE",
    headers: getHeaders(false),
  });
  if (!response.ok) throw new Error("Lỗi khi xóa từ vựng.");
  return await response.json();
};

interface PaginatedResponse {
  data: Idiom[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export const fetchStoredIdioms = async (
  page = 1,
  limit = 12,
  filter = ""
): Promise<PaginatedResponse> => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      filter: filter,
    }).toString();

    const response = await fetch(`${API_BASE_URL}/idioms?${query}`);
    if (!response.ok) throw new Error("Không thể lấy danh sách từ.");
    return await response.json();
  } catch (error) {
    console.warn(
      "Backend fetchAll failed, using LocalStorage fallback (No pagination)."
    );
    try {
      const stored = localStorage.getItem("custom_idioms");
      const data = stored ? JSON.parse(stored) : [];
      const filtered = filter
        ? data.filter(
            (item: any) =>
              item.hanzi.toLowerCase().includes(filter.toLowerCase()) ||
              item.pinyin.toLowerCase().includes(filter.toLowerCase())
          )
        : data;

      return {
        data: filtered,
        meta: { total: filtered.length, page: 1, lastPage: 1, limit },
      };
    } catch {
      return { data: [], meta: { total: 0, page: 1, lastPage: 1, limit } };
    }
  }
};

export const addToHistory = (idiom: Idiom) => {
  try {
    const stored = localStorage.getItem("search_history");
    let historyItems: Idiom[] = stored ? JSON.parse(stored) : [];
    historyItems = historyItems.filter((item) => item.hanzi !== idiom.hanzi);
    historyItems.unshift(idiom);
    if (historyItems.length > 50) {
      historyItems = historyItems.slice(0, 50);
    }
    localStorage.setItem("search_history", JSON.stringify(historyItems));
  } catch (e) {
    console.error("Error saving history", e);
  }
};
