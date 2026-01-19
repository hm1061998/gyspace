import { useState, useEffect, useCallback, useMemo } from "react";
import type { Idiom } from "@/types";
import {
  fetchSavedIdioms,
  toggleSaveIdiom,
  bulkDeleteSavedIdioms,
} from "@/services/api/userDataService";
import { modalService } from "@/libs/Modal";
import { toast } from "@/libs/Toast";

export const useSavedVocabulary = (initialPage = 1) => {
  const [savedItems, setSavedItems] = useState<Idiom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadSavedData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchSavedIdioms({ page, limit: 12 });
      setSavedItems(response.data);
      setTotalPages(response.meta.lastPage);
      setTotalItems(response.meta.total);
      setSelectedIds([]);
    } catch (e) {
      toast.error("Không thể tải danh sách từ vựng đã lưu.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  const handleRemove = async (idiomId: string, hanzi: string) => {
    try {
      await toggleSaveIdiom(idiomId);
      setSavedItems((prev) => prev.filter((item) => item.id !== idiomId));
      toast.info(`Đã bỏ lưu "${hanzi}"`);
      setSelectedIds((prev) => prev.filter((id) => id !== idiomId));
    } catch (e) {
      toast.error("Lỗi khi thực hiện thao tác.");
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
      await bulkDeleteSavedIdioms(selectedIds);
      toast.success(`Đã bỏ lưu ${selectedIds.length} từ vựng thành công!`);
      loadSavedData();
    } catch (error) {
      console.error(error);
      toast.error("Thao tác thất bại");
    }
  };

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
