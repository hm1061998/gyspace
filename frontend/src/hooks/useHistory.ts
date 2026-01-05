import { useState, useEffect, useCallback, useMemo } from "react";
import type { Idiom } from "@/types";
import {
  fetchHistory,
  clearAllHistory,
  bulkDeleteHistory,
} from "@/services/api/userDataService";
import { modalService } from "@/libs/Modal";
import { toast } from "@/libs/Toast";

export const useHistory = (initialPage = 1) => {
  const [historyItems, setHistoryItems] = useState<Idiom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounced search to avoid excessive API calls
  const [debouncedFilter, setDebouncedFilter] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 400);
    return () => clearTimeout(timer);
  }, [filter]);

  const loadHistoryData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchHistory({
        page,
        limit: 20,
        search: debouncedFilter,
      });
      setHistoryItems(response.data);
      setTotalPages(response.meta.lastPage);
      setTotalItems(response.meta.total);
      setSelectedIds([]);
    } catch (e) {
      toast.error("Không thể tải lịch sử.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedFilter]);

  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  // Reset page to 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedFilter]);

  const handleClearAll = async () => {
    const confirmed = await modalService.danger(
      "Bạn có chắc chắn muốn xóa toàn bộ lịch sử tra cứu không? Hành động này không thể hoàn tác.",
      "Xóa lịch sử"
    );

    if (confirmed) {
      try {
        await clearAllHistory();
        setHistoryItems([]);
        toast.info("Đã xóa lịch sử.");
      } catch (e) {
        toast.error("Xóa thất bại");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một mục để xóa");
      return;
    }

    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} mục trong lịch sử đã chọn không?`,
      "Xác nhận xóa?"
    );

    if (!confirmed) return;

    try {
      await bulkDeleteHistory(selectedIds);
      toast.success(`Đã xóa ${selectedIds.length} mục thành công!`);
      loadHistoryData();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại");
    }
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
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const isAllSelected = useMemo(
    () =>
      filteredItems.length > 0 && selectedIds.length === filteredItems.length,
    [filteredItems, selectedIds]
  );

  const isSomeSelected = useMemo(
    () => selectedIds.length > 0 && selectedIds.length < filteredItems.length,
    [filteredItems, selectedIds]
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
