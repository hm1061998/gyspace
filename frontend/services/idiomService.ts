import { Idiom, SearchMode } from "../types";
import {
  TABLE_IDIOMS,
  TABLE_CHARACTER_ANALYSIS,
  TABLE_EXAMPLES,
} from "../data/database";
import { getAuthToken } from "./authService";

const getEnv = (key: string) => {
  // Cách 1: Chuẩn Vite (import.meta.env)
  if ((import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Cách 2: Chuẩn Webpack/CRA/Next.js (process.env)
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return null;
};

const getHeaders = (isJson = true) => {
  const headers: any = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// const API_BASE_URL = getEnv("VITE_API_URL") || getEnv("REACT_APP_API_URL");
const API_BASE_URL = "/api";
// Khởi tạo Gemini Client-side cho chế độ Fallback

// Hàm giả lập tìm kiếm trong Database (Client-side Fallback)
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

  // // 2. Nếu không tìm thấy, tìm trong LocalStorage (Custom Database)
  // if (!result) {
  //   try {
  //     const stored = localStorage.getItem("custom_idioms");
  //     if (stored) {
  //       const customIdioms = JSON.parse(stored);
  //       const found = customIdioms.find(
  //         (i: any) =>
  //           i.hanzi === normalizedQuery ||
  //           i.pinyin.toLowerCase().includes(normalizedQuery) ||
  //           i.vietnameseMeaning.toLowerCase().includes(normalizedQuery)
  //       );
  //       if (found) {
  //         result = { ...found, dataSource: "local" };
  //       }
  //     }
  //   } catch (e) {
  //     console.error("Lỗi đọc LocalStorage", e);
  //   }
  // }

  return result;
};

export const fetchIdiomDetails = async (
  query: string,
  mode: SearchMode = "database"
): Promise<Idiom & { dataSource: string }> => {
  // 1. Cố gắng gọi Backend API trước
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Timeout 2s

    const response = await fetch(
      `${API_BASE_URL}/idioms/search?query=${encodeURIComponent(
        query
      )}&mode=${mode}`,
      {
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    // Kiểm tra xem phản hồi có phải là JSON không (tránh lỗi cú pháp khi nhận về HTML 404)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      if (!response.ok) {
        const errorData = await response.json();
        // Nếu backend trả về 404, ta vẫn ném lỗi để catch bên dưới xử lý logic AI fallback nếu cần
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

    // 2. Fallback: Xử lý Client-side

    // Bước A: Tìm trong dữ liệu mẫu (Database giả lập + LocalStorage)
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
  // Ưu tiên gọi Backend, nhưng có timeout để tránh bị treo (Pending)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout 3s

    const response = await fetch(`${API_BASE_URL}/idioms`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Nếu backend trả về lỗi (ví dụ 409 conflict, hoặc 500), throw để hiển thị
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Lỗi backend.");
    }

    return await response.json();
  } catch (error: any) {
    console.warn(
      "Backend create failed or timeout, saving to LocalStorage.",
      error
    );

    // Fallback: Lưu vào LocalStorage
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
  }
};

export const bulkCreateIdioms = async (data: any[]) => {
  const response = await fetch(`${API_BASE_URL}/idioms/bulk`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Lỗi khi import hàng loạt.");
  return await response.json();
};

export const updateIdiom = async (id: string, data: any) => {
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
  const response = await fetch(`${API_BASE_URL}/idioms/${id}`, {
    method: "DELETE",
    headers: getHeaders(false),
  });
  if (!response.ok) throw new Error("Lỗi khi xóa từ vựng.");
  return await response.json();
};

// Cập nhật để trả về dạng phân trang
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
      // Fallback đơn giản: Trả về tất cả ở trang 1
      const stored = localStorage.getItem("custom_idioms");
      const data = stored ? JSON.parse(stored) : [];
      // Lọc local nếu có filter
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
