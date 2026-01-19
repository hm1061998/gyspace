import { useQuery } from "@tanstack/react-query";
import {
  fetchIdiomDetails,
  fetchSuggestions,
  fetchIdiomById,
  fetchStoredIdioms,
  fetchDailySuggestions,
  deleteIdiom,
  bulkDeleteIdioms,
  bulkCreateIdioms,
} from "@/services/api/idiomService";
import { QueryParams } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/libs/Toast";
import { queryKeys } from "@/services/queryKeys";

export const useIdiomDetails = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.idioms.details(query),
    queryFn: () => fetchIdiomDetails(query),
    enabled: !!query && enabled,
    retry: false, // Don't retry if not found immediately, or strictly once
    staleTime: 5 * 60 * 1000,
  });
};

export const useStoredIdiomsList = (
  params: QueryParams,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: queryKeys.idioms.stored.list(params),
    queryFn: () => fetchStoredIdioms(params),
    enabled,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};

export const useIdiomById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.idioms.byId(id),
    queryFn: () => fetchIdiomById(id),
    enabled: !!id && enabled,
    staleTime: 30 * 60 * 1000,
  });
};

export const useIdiomSuggestions = (params: QueryParams) => {
  return useQuery({
    queryKey: queryKeys.idioms.suggestions(params),
    queryFn: () => fetchSuggestions(params),
    enabled: !!params.search,
    staleTime: 60 * 1000,
  });
};

export const useDailySuggestions = () => {
  return useQuery({
    queryKey: queryKeys.idioms.daily(),
    queryFn: fetchDailySuggestions,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

// --- Mutations ---

export const useDeleteIdiomMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIdiom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.idioms.stored.all });
    },
  });
};

export const useBulkDeleteIdiomsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteIdioms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.idioms.stored.all });
    },
  });
};

export const useImportIdiomsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateIdioms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.idioms.stored.all });
    },
  });
};
