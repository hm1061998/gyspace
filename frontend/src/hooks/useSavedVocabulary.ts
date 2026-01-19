import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSavedIdiomsList,
  useToggleSaveIdiom,
  useBulkDeleteSaved,
} from "@/hooks/queries/useUserData";
import { modalService } from "@/libs/Modal";
import { toast } from "@/libs/Toast";
import { queryKeys } from "@/services/queryKeys";

export const useSavedVocabulary = (initialPage = 1) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialPage);
  const [filter, setFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Query
  const { data, isLoading: loading } = useSavedIdiomsList(
    { page, limit: 12 },
    true,
  );

  const savedItems = data?.data || [];
  const totalPages = data?.meta?.lastPage || 1;
  const totalItems = data?.meta?.total || 0;

  // Mutations
  const toggleSaveMutation = useToggleSaveIdiom();
  const bulkDeleteMutation = useBulkDeleteSaved();

  const handleRemove = async (idiomId: string, hanzi: string) => {
    try {
      await toggleSaveMutation.mutateAsync(idiomId);
      toast.info(`Đã bỏ lưu "${hanzi}"`);
      setSelectedIds((prev) => prev.filter((id) => id !== idiomId));
      // Invalidation handled by mutation hook
    } catch (e) {
      // Error handled in mutation hook
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một mục để bỏ lưu");
      return;
    }

    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn bỏ lưu ${selectedIds.length} từ vựng đã chọn không?`,
      "Xác nhận bỏ lưu?",
    );

    if (!confirmed) return;

    try {
      await bulkDeleteMutation.mutateAsync(selectedIds);
      toast.success(`Đã bỏ lưu các từ vựng thành công!`);
      setSelectedIds([]);
    } catch (error) {
      // Error handled
    }
  };

  // Client-side filtering logic (preserved from original)
  const filteredItems = useMemo(() => {
    return savedItems.filter(
      (item) =>
        item.hanzi.includes(filter) ||
        item.vietnameseMeaning.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [savedItems, filter]);

  const toggleSelectAll = useCallback(() => {
    if (
      filteredItems.length > 0 &&
      selectedIds.length === filteredItems.length
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id!));
    }
  }, [filteredItems, selectedIds]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const isAllSelected = useMemo(
    () =>
      filteredItems.length > 0 && selectedIds.length === filteredItems.length,
    [filteredItems, selectedIds],
  );

  const isSomeSelected = useMemo(
    () => selectedIds.length > 0 && selectedIds.length < filteredItems.length,
    [filteredItems, selectedIds],
  );

  // Handlers for manual reload if needed
  const loadSavedData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.saved.all });
  };

  return {
    savedItems,
    loading,
    filter,
    setFilter,
    selectedIds,
    setSelectedIds,
    page,
    setPage,
    totalPages,
    totalItems,
    filteredItems,
    handleRemove,
    handleBulkDelete,
    toggleSelectAll,
    toggleSelect,
    isAllSelected,
    isSomeSelected,
    loadSavedData,
  };
};
