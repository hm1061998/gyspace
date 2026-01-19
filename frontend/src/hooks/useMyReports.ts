import { useState, useEffect, useCallback, useMemo } from "react";
import { modalService } from "@/libs/Modal";
import { DictionaryReport } from "@/services/api/reportService";
import {
  useMyReportsList,
  useDeleteReports,
} from "@/hooks/queries/useUserData";

export const useMyReports = (initialPage = 1) => {
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
    refetch: loadData,
  } = useMyReportsList({
    page,
    limit: 20,
    filter: {
      idiomId: debouncedFilter,
    },
  });

  const historyItems = response?.data || [];
  const totalPages = response?.meta?.lastPage || 1;
  const totalItems = response?.meta?.total || 0;

  // Mutation
  const { mutateAsync: deleteReports } = useDeleteReports();

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      // toast.warning("Vui lòng chọn ít nhất một mục để xóa");
      return;
    }

    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} mục trong danh sách đã chọn không?`,
      "Xác nhận xóa?",
    );

    if (!confirmed) return;

    await deleteReports(selectedIds);
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
    handleBulkDelete,
    toggleSelectAll,
    toggleSelect,
    isAllSelected,
    isSomeSelected,
    loadData,
  };
};
