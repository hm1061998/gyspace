import { http } from "./httpService";
import { Idiom, SearchMode, QueryParams, PaginatedResponse } from "@/types";
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

/**
 * Fetch suggestions for search autocomplete
 */
export const fetchSuggestions = async (
  params: QueryParams = {}
): Promise<PaginatedResponse<Idiom> & { meta: { hasMore: boolean } }> => {
  const response = await http.get<
    PaginatedResponse<Idiom> & { meta: { hasMore: boolean } }
  >("/idioms/suggestions", params);
  return response.data;
};

let dailySuggestionsCache: Idiom[] | null = null;
let lastCacheTime: number = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const fetchDailySuggestions = async (): Promise<Idiom[]> => {
  const now = Date.now();
  if (dailySuggestionsCache && now - lastCacheTime < CACHE_TTL) {
    return dailySuggestionsCache;
  }
  const response = await http.get<Idiom[]>("/idioms/daily");
  dailySuggestionsCache = response.data;
  lastCacheTime = now;
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

export const bulkDeleteIdioms = async (ids: string[]) => {
  const response = await http.post("/idioms/bulk-delete", { ids });
  return response.data;
};

/**
 * Fetch list of idioms with search and filters
 */
export const fetchStoredIdioms = async (
  params: QueryParams = {}
): Promise<PaginatedResponse<Idiom>> => {
  const { filter, sort = "createdAt,DESC", ...rest } = params;

  try {
    const response = await http.get<PaginatedResponse<Idiom>>("/idioms", {
      ...rest,
      sort,
      filter,
    });
    return response.data;
  } catch (error) {
    console.warn("Backend fetchAll failed, using LocalStorage fallback.");
    const search = rest.search || "";
    try {
      const stored = localStorage.getItem("custom_idioms");
      const data = stored ? JSON.parse(stored) : [];
      const filtered = search
        ? data.filter(
            (item: any) =>
              item.hanzi.toLowerCase().includes(search.toLowerCase()) ||
              item.pinyin.toLowerCase().includes(search.toLowerCase())
          )
        : data;

      return {
        data: filtered,
        meta: {
          total: filtered.length,
          page: 1,
          lastPage: 1,
          limit: params.limit || 12,
        },
      };
    } catch {
      return {
        data: [],
        meta: { total: 0, page: 1, lastPage: 1, limit: params.limit || 12 },
      };
    }
  }
};

/**
 * Add idiom to local search history (localStorage)
 * Note: For server-side history, use userDataService.addToHistory
 */
export const addToLocalHistory = (idiom: Idiom) => {
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

export interface SearchLog {
  query: string;
  count: number;
  lastSearched: string;
}

export const fetchSearchLogs = async (
  params: QueryParams = {}
): Promise<PaginatedResponse<any>> => {
  const { filter, ...rest } = params;

  const response = await http.get<PaginatedResponse<any>>(
    "/idioms/admin/search-logs",
    params
  );
  return response.data;
};

export const deleteSearchLog = async (query: string) => {
  const response = await http.delete(
    `/idioms/admin/search-logs/${encodeURIComponent(query)}`
  );
  return response.data;
};

export const bulkDeleteSearchLogs = async (queries: string[]) => {
  const response = await http.post("/idioms/admin/search-logs/bulk-delete", {
    queries,
  });
  return response.data;
};
