import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminStats,
  fetchSearchAnalytics,
  fetchUserGrowth,
} from "@/services/api/idiomService";
import { fetchCommentStats } from "@/services/api/commentService";
import { getReportStats } from "@/services/api/reportService";
import { queryKeys } from "@/services/queryKeys";

// Admin Stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Comment Stats
export const useCommentStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.comments.stats(),
    queryFn: fetchCommentStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Report Stats
export const useReportStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.reports.stats(),
    queryFn: getReportStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Analytics (Search & Growth)
export const useAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.admin.analytics(),
    queryFn: async () => {
      const [searchAnalytics, userGrowth] = await Promise.all([
        fetchSearchAnalytics(),
        fetchUserGrowth(),
      ]);
      return { searchAnalytics, userGrowth };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// --- Comments Management ---

import {
  fetchAllComments,
  updateCommentStatus,
  deleteComment,
  bulkDeleteComments,
} from "@/services/api/commentService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryParams } from "@/types";

export const useCommentsList = (params: QueryParams) => {
  return useQuery({
    queryKey: queryKeys.admin.comments.list(params),
    queryFn: () => fetchAllComments(params),
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000,
  });
};

export const useUpdateCommentStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => updateCommentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments.all }); // covers list and stats
    },
  });
};

export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments.all });
    },
  });
};

export const useBulkDeleteCommentsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteComments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments.all });
    },
  });
};
