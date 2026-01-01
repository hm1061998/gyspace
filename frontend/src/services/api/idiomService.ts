import { http } from "./httpService";
import { Idiom, SearchMode } from "@/types";
import {
  TABLE_IDIOMS,
  TABLE_CHARACTER_ANALYSIS,
  TABLE_EXAMPLES,
} from "@/data/database";

// --- Local Fallback Helpers ---

const saveLocalIdiom = (data: any) => {
  try {
    const stored = localStorage.getItem("custom_idioms");
    const customIdioms = stored ? JSON.parse(stored) : [];

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

// --- API Services ---

export const fetchAdminStats = async () => {
  const response = await http.get("/idioms/admin/stats");
  return response.data;
};

export const fetchIdiomDetails = async (
  query: string,
  mode: SearchMode = "database"
): Promise<Idiom & { dataSource: string }> => {
  try {
    const response = await http.get<Idiom & { dataSource: string }>(
      "/idioms/search",
      { query, mode }
    );
    return response.data;
  } catch (error: any) {
    console.warn(
      "Kết nối Backend thất bại, chuyển sang chế độ Client-side Fallback:",
      error.message
    );
    const localResult = searchLocalDatabase(query);
    if (localResult) return localResult;
    throw error;
  }
};

export const fetchIdiomById = async (id: string): Promise<Idiom> => {
  const response = await http.get<Idiom>(`/idioms/${id}`);
  return response.data;
};

export const createIdiom = async (data: any) => {
  try {
    const response = await http.post("/idioms", data);
    return response.data;
  } catch (error: any) {
    console.warn("Backend create failed, saving to LocalStorage.", error);
    return saveLocalIdiom(data);
  }
};

export const bulkCreateIdioms = async (idioms: any[]) => {
  const response = await http.post("/idioms/bulk", { idioms });
  return response.data;
};

export const updateIdiom = async (id: string, data: any) => {
  const response = await http.put(`/idioms/${id}`, data);
  return response.data;
};

export const deleteIdiom = async (id: string) => {
  const response = await http.delete(`/idioms/${id}`);
  return response.data;
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
  filter = "",
  level = "",
  type = ""
): Promise<PaginatedResponse> => {
  try {
    const response = await http.get<PaginatedResponse>("/idioms", {
      page,
      limit,
      filter,
      level,
      type,
      sort: "createdAt",
      order: "DESC",
    });
    return response.data;
  } catch (error) {
    console.warn("Backend fetchAll failed, using LocalStorage fallback.");
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
    if (historyItems.length > 50) historyItems = historyItems.slice(0, 50);
    localStorage.setItem("search_history", JSON.stringify(historyItems));
  } catch (e) {
    console.error("Error saving history", e);
  }
};
