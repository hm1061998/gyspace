import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAdminStats,
  fetchSearchAnalytics,
  fetchUserGrowth,
} from "@/services/api/idiomService";
import {
  fetchCommentStats,
  type CommentStats,
} from "@/services/api/commentService";
import { getReportStats } from "@/services/api/reportService";

interface Stats {
  totalIdioms: number;
  levelStats: Array<{ name: string; count: number }>;
  typeStats: Array<{ name: string; count: number }>;
  recentIdioms: any[];
  contentHealth: {
    missingExamples: number;
    missingImages: number;
    missingOrigin: number;
  };
  hotKeywords: Array<{ query: string; count: number }>;
  totalUsers: number;
  totalSearches: number;
  [key: string]: any;
}

interface SearchAnalytics {
  last7Days: Array<{ date: string; count: number }>;
}

interface UserGrowth {
  date: string;
  count: number;
}

interface AdminState {
  stats: Stats | null;
  commentStats: CommentStats | null;
  reportStats: { pending: number; topReported: any[] } | null;
  searchAnalytics: SearchAnalytics | null;
  userGrowth: UserGrowth[] | null;
  loading: boolean;
  commentLoading: boolean;
  reportLoading: boolean;
  analyticsLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  commentsLastUpdated: number | null;
  reportsLastUpdated: number | null;
  analyticsLastUpdated: number | null;
}

const initialState: AdminState = {
  stats: null,
  commentStats: null,
  reportStats: null,
  searchAnalytics: null,
  userGrowth: null,
  loading: false,
  commentLoading: false,
  reportLoading: false,
  analyticsLoading: false,
  error: null,
  lastUpdated: null,
  commentsLastUpdated: null,
  reportsLastUpdated: null,
  analyticsLastUpdated: null,
};

// Async thunk to fetch admin stats with caching logic
export const getAdminStats = createAsyncThunk(
  "admin/getStats",
  async (force: boolean | undefined, { getState, rejectWithValue }) => {
    const state = getState() as { admin: AdminState };
    const { lastUpdated, stats } = state.admin;

    // Cache logic: avoid fetching if data exists and is less than 2 minutes old,
    // unless 'force' is true.
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
    const isFresh = lastUpdated && Date.now() - lastUpdated < CACHE_DURATION;

    if (!force && stats && isFresh) {
      return stats; // Return existing stats if fresh
    }

    try {
      const data = await fetchAdminStats();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Không thể tải thống kê");
    }
  }
);

// Async thunk to fetch comment stats with caching logic
export const getCommentStats = createAsyncThunk(
  "admin/getCommentStats",
  async (force: boolean | undefined, { getState, rejectWithValue }) => {
    const state = getState() as { admin: AdminState };
    const { commentsLastUpdated, commentStats } = state.admin;

    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for comments
    const isFresh =
      commentsLastUpdated && Date.now() - commentsLastUpdated < CACHE_DURATION;

    if (!force && commentStats && isFresh) {
      return commentStats;
    }

    try {
      const data = await fetchCommentStats();
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Không thể tải thống kê bình luận"
      );
    }
  }
);

// Async thunk to fetch report stats
export const fetchReportStats = createAsyncThunk(
  "admin/fetchReportStats",
  async (force: boolean | undefined, { getState, rejectWithValue }) => {
    const state = getState() as { admin: AdminState };
    const { reportsLastUpdated, reportStats } = state.admin;

    const CACHE_DURATION = 5 * 60 * 1000;
    const isFresh =
      reportsLastUpdated && Date.now() - reportsLastUpdated < CACHE_DURATION;

    if (!force && reportStats && isFresh) {
      return reportStats;
    }

    try {
      const data = await getReportStats();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Không thể tải thống kê báo cáo");
    }
  }
);

// Async thunk to fetch analytics (search & user growth)
export const getAnalytics = createAsyncThunk(
  "admin/getAnalytics",
  async (force: boolean | undefined, { getState, rejectWithValue }) => {
    const state = getState() as { admin: AdminState };
    const { analyticsLastUpdated, searchAnalytics } = state.admin;

    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
    const isFresh =
      analyticsLastUpdated &&
      Date.now() - analyticsLastUpdated < CACHE_DURATION;

    if (!force && searchAnalytics && isFresh) {
      return {
        searchAnalytics: state.admin.searchAnalytics,
        userGrowth: state.admin.userGrowth,
      };
    }

    try {
      const [searchData, growthData] = await Promise.all([
        fetchSearchAnalytics(),
        fetchUserGrowth(),
      ]);
      return { searchAnalytics: searchData, userGrowth: growthData };
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Không thể tải phân tích dữ liệu"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminStats: (state) => {
      state.stats = null;
      state.commentStats = null;
      state.reportStats = null;
      state.lastUpdated = null;
      state.commentsLastUpdated = null;
      state.reportsLastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Comment Stats
      .addCase(getCommentStats.pending, (state) => {
        state.commentLoading = true;
      })
      .addCase(getCommentStats.fulfilled, (state, action) => {
        state.commentLoading = false;
        state.commentStats = action.payload;
        state.commentsLastUpdated = Date.now();
      })
      .addCase(getCommentStats.rejected, (state) => {
        state.commentLoading = false;
      })
      // Report Stats
      .addCase(fetchReportStats.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(fetchReportStats.fulfilled, (state, action) => {
        state.reportLoading = false;
        state.reportStats = action.payload;
        state.reportsLastUpdated = Date.now();
      })
      .addCase(fetchReportStats.rejected, (state) => {
        state.reportLoading = false;
      })
      // Analytics
      .addCase(getAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.searchAnalytics = action.payload.searchAnalytics;
        state.userGrowth = action.payload.userGrowth;
        state.analyticsLastUpdated = Date.now();
      })
      .addCase(getAnalytics.rejected, (state) => {
        state.analyticsLoading = false;
      });
  },
});

export const { clearAdminStats } = adminSlice.actions;
export default adminSlice.reducer;
