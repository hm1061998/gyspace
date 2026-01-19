import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHistory,
  addToHistory,
  clearAllHistory,
  bulkDeleteHistory,
  fetchSRSData,
  updateSRSProgress,
  fetchSavedIdioms,
  updateProfile,
  changePassword,
  fetchUserProfile,
  toggleSaveIdiom,
  bulkDeleteSavedIdioms,
  type UpdateProfileData,
  type ChangePasswordData,
} from "@/services/api/userDataService";
import { getMyReports, bulkDeleteReport } from "@/services/api/reportService";
import { QueryParams } from "@/types";
import { toast } from "@/libs/Toast";
import { queryKeys } from "@/services/queryKeys";

// --- Queries ---

export const useHistoryList = (params: QueryParams) => {
  return useQuery({
    queryKey: queryKeys.user.history.list(params),
    queryFn: () => fetchHistory(params),
    placeholderData: (prev) => prev,
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyReportsList = (params: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.user.reports.list(params),
    queryFn: () => getMyReports(params),
    enabled,
    placeholderData: (prev) => prev,
  });
};

export const useSavedIdiomsList = (
  params: QueryParams,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: queryKeys.user.saved.list(params),
    queryFn: () => fetchSavedIdioms(params),
    enabled,
    placeholderData: (prev) => prev,
  });
};

export const useSRSData = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.user.srs.data(),
    queryFn: () => fetchSRSData({ page: 1, limit: 500 }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// --- Mutations ---

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user.profile(), data);
      toast.success("Cập nhật thông tin thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật thông tin");
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể đổi mật khẩu");
    },
  });
};

export const useUpdateSRS = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quality }: { id: string; quality: number }) =>
      updateSRSProgress(id, { quality }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.srs.all });
    },
  });
};

export const useDeleteReports = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteReport,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.reports.all });
      toast.success(`Đã xóa ${variables.length} mục thành công!`);
    },
    onError: () => {
      toast.error("Xóa thất bại");
    },
  });
};

// --- History Mutations ---

export const useAddToHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToHistory,
    onSuccess: () => {
      // Invalidate history list
      queryClient.invalidateQueries({ queryKey: queryKeys.user.history.all });
    },
  });
};

export const useClearHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearAllHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.history.all });
      toast.info("Đã xóa lịch sử.");
    },
    onError: () => {
      toast.error("Xóa thất bại");
    },
  });
};

export const useDeleteHistoryItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteHistory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.history.all });
      toast.success(`Đã xóa ${variables.length} mục thành công!`);
    },
    onError: () => {
      toast.error("Xóa thất bại");
    },
  });
};

// --- Saved Idioms Mutations ---

export const useToggleSaveIdiom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleSaveIdiom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.saved.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.srs.all });
    },
  });
};

export const useBulkDeleteSaved = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteSavedIdioms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.saved.all });
    },
  });
};
