import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  TrashIcon,
  BookmarkIconFilled,
  SearchIcon,
  SpinnerIcon,
  ChevronRightIcon,
} from "@/components/common/icons";
import type { Idiom } from "@/types";
import {
  fetchSavedIdioms,
  toggleSaveIdiom,
  bulkDeleteSavedIdioms,
} from "@/services/api/userDataService";
import { toast } from "@/services/ui/toastService";
import { modalService } from "@/services/ui/modalService";
import Pagination from "@/components/common/Pagination";
import BulkActionBar from "@/components/common/BulkActionBar";

interface SavedVocabularyProps {
  onBack: () => void;
}

const SavedVocabulary: React.FC<SavedVocabularyProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<Idiom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadSavedData();
  }, [page]);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const response = await fetchSavedIdioms(page, 12);
      setSavedItems(response.data);
      setTotalPages(response.meta.lastPage);
      setTotalItems(response.meta.total);
      setSelectedIds([]); // Clear selection when data changes
    } catch (e) {
      toast.error("Không thể tải danh sách từ vựng đã lưu.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (
    e: React.MouseEvent,
    idiomId: string,
    hanzi: string
  ) => {
    e.stopPropagation();
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
      "Xác nhận bỏ lưu?"
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

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id!));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredItems = savedItems.filter(
    (item) =>
      item.hanzi.includes(filter) ||
      item.vietnameseMeaning.toLowerCase().includes(filter.toLowerCase())
  );

  const isAllSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < filteredItems.length;
  return (
    <div className="max-w-6xl mx-auto w-full animate-pop">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center w-full md:w-auto">
          <h1 className="text-2xl font-hanzi font-bold text-slate-800 flex items-center gap-2">
            <BookmarkIconFilled className="w-6 h-6 text-red-600" />
            Từ vựng đã lưu ({savedItems.length})
          </h1>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm trong danh sách đã lưu..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-200 bg-white/50 backdrop-blur-sm"
          />
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <SpinnerIcon className="w-10 h-10 text-red-600" />
        </div>
      ) : savedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <BookmarkIconFilled className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-lg font-medium">Bạn chưa lưu từ vựng nào.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-red-600 font-bold hover:underline"
          >
            Khám phá ngay
          </button>
        </div>
      ) : (
        <React.Fragment>
          {/* Bulk Actions Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onDelete={handleBulkDelete}
            onClearSelection={() => setSelectedIds([])}
            label="từ vựng"
            deleteLabel="Bỏ lưu đã chọn"
          />

          {/* Select All Checkbox */}
          {filteredItems.length > 0 && (
            <div className="mb-3 flex items-center gap-2 px-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = isSomeSelected;
                  }
                }}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              />
              <label
                className="text-sm font-medium text-slate-600 cursor-pointer"
                onClick={toggleSelectAll}
              >
                Chọn tất cả ({filteredItems.length} mục)
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.hanzi}
                onClick={() =>
                  navigate(`/?query=${encodeURIComponent(item.hanzi)}`)
                }
                className={`bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition-all group relative overflow-hidden ${
                  selectedIds.includes(item.id!)
                    ? "border-indigo-400 bg-indigo-50/30 shadow-md"
                    : "border-slate-200 hover:shadow-md hover:border-red-200"
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id!)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id!);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between items-start mb-3 pl-6">
                  <h2 className="text-3xl font-hanzi font-bold text-slate-800 group-hover:text-red-700">
                    {item.hanzi}
                  </h2>
                  <button
                    onClick={(e) =>
                      item.id && handleRemove(e, item.id, item.hanzi)
                    }
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Bỏ lưu"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-red-500 font-medium mb-2">{item.pinyin}</p>
                <p className="text-slate-600 text-sm line-clamp-2">
                  {item.vietnameseMeaning}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-end">
                  <span className="text-xs text-red-600 font-bold">
                    Xem chi tiết →
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="pt-8 border-t border-slate-100"
          />
        </React.Fragment>
      )}
    </div>
  );
};

export default SavedVocabulary;
