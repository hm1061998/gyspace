import { useState, useEffect, useCallback, useMemo } from "react";
import type { Idiom } from "@/types";
import { modalService } from "@/libs/Modal";
import {
  useHistoryList,
  useClearHistory,
  useDeleteHistoryItems,
} from "@/hooks/queries/useUserData";

export const useHistory = (initialPage = 1) => {
  const [filter, setFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(initialPage);

  // Debounced search to avoid excessive API calls
  const [debouncedFilter, setDebouncedFilter] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 400);
    return () => clearTimeout(timer);
  }, [filter]);

  // Reset page to 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedFilter]);

  // Query
  const {
    data: response,
    isLoading: loading,
    refetch: loadHistoryData,
  } = useHistoryList({
    page,
    limit: 20,
    search: debouncedFilter,
  });

  const historyItems = response?.data || [];
  const totalPages = response?.meta?.lastPage || 1;
  const totalItems = response?.meta?.total || 0;

  // Mutations
  const { mutateAsync: clearAll } = useClearHistory();
  const { mutateAsync: bulkDelete } = useDeleteHistoryItems();

  const handleClearAll = async () => {
    const confirmed = await modalService.danger(
      "Bạn có chắc chắn muốn xóa toàn bộ lịch sử tra cứu không? Hành động này không thể hoàn tác.",
      "Xóa lịch sử",
    );

    if (confirmed) {
      // Clear local selection if any
      setSelectedIds([]);
      await clearAll();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      // toast.warning handled by UI usually, but we can keep logic here if needed
      // Actually the original code had toast.warning. Let's rely on UI to disable button, or just check here.
      return;
    }

    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} mục trong lịch sử đã chọn không?`,
      "Xác nhận xóa?",
    );

    if (!confirmed) return;

    await bulkDelete(selectedIds);
    setSelectedIds([]);
  };

  const filteredItems = historyItems;

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

  return {
    historyItems,
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
    handleClearAll,
    handleBulkDelete,
    toggleSelectAll,
    toggleSelect,
    isAllSelected,
    isSomeSelected,
    loadHistoryData,
  };
};
