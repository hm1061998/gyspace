import { http } from "./httpService";
import type { Feedback } from "@/types";

/**
 * Comment Service
 * Handles all API calls related to idiom comments
 */

// ============================================
// User Comment APIs
// ============================================

/**
 * Fetch approved comments for a specific idiom
 */
export const fetchCommentsByIdiom = async (
  idiomId: string,
  page: number = 1,
  limit: number = 10,
  sort: string = "createdAt",
  order: "ASC" | "DESC" = "DESC"
): Promise<{ data: Feedback[]; meta: any }> => {
  const response = await http.get<{ data: Feedback[]; meta: any }>(
    `/idiom-comments/idiom/${idiomId}`,
    { page, limit, sort, order }
  );
  return response.data;
};

/**
 * Create a new comment
 */
export const createComment = async (data: {
  content: string;
  idiomId: string;
}): Promise<Feedback> => {
  const response = await http.post<Feedback>("/idiom-comments", data);
  return response.data;
};

/**
 * Like a comment
 */
export const likeComment = async (commentId: string): Promise<Feedback> => {
  const response = await http.post<Feedback>(
    `/idiom-comments/${commentId}/like`
  );
  return response.data;
};

/**
 * Report a comment
 */
export const reportComment = async (commentId: string): Promise<Feedback> => {
  const response = await http.post<Feedback>(
    `/idiom-comments/${commentId}/report`
  );
  return response.data;
};

// ============================================
// Admin Comment APIs
// ============================================

export interface CommentQueryParams {
  status?: "pending" | "approved" | "rejected";
  idiomId?: string;
  userId?: string;
  search?: string;
  onlyReported?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedCommentsResponse {
  data: Feedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageProcessingTime: number;
  topReported: Array<{
    id: string;
    hanzi: string;
    pinyin: string;
    totalreports: number;
  }>;
}

/**
 * Fetch all comments with filters (Admin only)
 */
export const fetchAllComments = async (
  params: CommentQueryParams = {}
): Promise<PaginatedCommentsResponse> => {
  const response = await http.get<PaginatedCommentsResponse>(
    "/idiom-comments/admin/all",
    params
  );
  return response.data;
};

/**
 * Fetch comment statistics (Admin only)
 */
export const fetchCommentStats = async (): Promise<CommentStats> => {
  const response = await http.get<CommentStats>("/idiom-comments/admin/stats");
  return response.data;
};

/**
 * Update comment status (Admin only)
 */
export const updateCommentStatus = async (
  commentId: string,
  status: "approved" | "rejected"
): Promise<Feedback> => {
  const response = await http.patch<Feedback>(
    `/idiom-comments/admin/${commentId}/status`,
    { status }
  );
  return response.data;
};

/**
 * Delete a comment (Admin only)
 */
export const deleteComment = async (
  commentId: string
): Promise<{ message: string }> => {
  const response = await http.delete<{ message: string }>(
    `/idiom-comments/admin/${commentId}`
  );
  return response.data;
};

/**
 * Bulk delete comments (Admin only)
 */
export const bulkDeleteComments = async (
  ids: string[]
): Promise<{ success: boolean; deleted: number }> => {
  const response = await http.post<{ success: boolean; deleted: number }>(
    "/idiom-comments/admin/bulk-delete",
    { ids }
  );
  return response.data;
};

// ============================================
// Local Storage Helpers
// ============================================

const LIKED_COMMENTS_KEY = "user_liked_comments";

/**
 * Get user's liked comments from localStorage
 */
export const getLikedComments = (): string[] => {
  try {
    const stored = localStorage.getItem(LIKED_COMMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading liked comments:", error);
    return [];
  }
};

/**
 * Save a comment ID to liked list in localStorage
 */
export const saveLikedComment = (commentId: string): void => {
  try {
    const likedComments = getLikedComments();
    if (!likedComments.includes(commentId)) {
      likedComments.push(commentId);
      localStorage.setItem(LIKED_COMMENTS_KEY, JSON.stringify(likedComments));
    }
  } catch (error) {
    console.error("Error saving liked comment:", error);
  }
};
