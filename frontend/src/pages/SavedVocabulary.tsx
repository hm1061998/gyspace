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
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";

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
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/50">
      {/* Fixed Top Section: Header & Filters */}
      <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-10 px-4 py-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-hanzi font-bold text-slate-800 flex items-center gap-2">
              <BookmarkIconFilled className="w-6 h-6 text-red-600" />
              Từ vựng đã lưu
              <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-full border border-red-100 uppercase tracking-widest font-black">
                {totalItems} mục
              </span>
            </h1>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Tìm trong danh sách đã lưu..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 bg-slate-50 transition-all text-sm"
            />
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Middle Section: Scrollable List */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar px-3 md:px-4 pb-6 pt-2">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <SpinnerIcon className="w-10 h-10 text-red-600 animate-spin mb-4" />
              <p className="font-bold text-xs uppercase tracking-widest">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <BookmarkIconFilled className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-bold text-slate-300">
                Bạn chưa lưu từ vựng nào.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all text-sm uppercase tracking-wider"
              >
                Khám phá ngay
              </button>
            </div>
          ) : (
            <>
              {/* Bulk Actions Bar */}
              <BulkActionBar
                selectedCount={selectedIds.length}
                onDelete={handleBulkDelete}
                onClearSelection={() => setSelectedIds([])}
                label="từ vựng"
                deleteLabel="Bỏ lưu đã chọn"
              />

              <SelectAllCheckbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={toggleSelectAll}
                subLabel={`(${filteredItems.length} mục)`}
                className="mb-4"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {filteredItems.map((item) => (
                  <div
                    key={item.hanzi}
                    onClick={() =>
                      navigate(`/?query=${encodeURIComponent(item.hanzi)}`)
                    }
                    className={`bg-white p-5 rounded-2xl shadow-sm border cursor-pointer transition-all group relative overflow-hidden ${
                      selectedIds.includes(item.id!)
                        ? "border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-50 shadow-md"
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

                    <div className="flex justify-between items-start mb-2 pl-6">
                      <h2 className="text-2xl font-hanzi font-bold text-slate-800 group-hover:text-red-700 transition-colors">
                        {item.hanzi}
                      </h2>
                      <button
                        onClick={(e) =>
                          item.id && handleRemove(e, item.id, item.hanzi)
                        }
                        className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Bỏ lưu"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-red-600 font-bold text-xs uppercase tracking-tight mb-2">
                      {item.pinyin}
                    </p>
                    <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
                      {item.vietnameseMeaning}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-end">
                      <span className="text-[10px] text-red-600 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Xem chi tiết →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {filteredItems.length === 0 && filter && (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                  <SearchIcon className="w-10 h-10 mb-2 opacity-10" />
                  <p className="text-sm italic">
                    Không tìm thấy kết quả nào khớp với "{filter}"
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      {totalPages > 1 && (
        <div className="flex-none bg-white border-t border-slate-200 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedVocabulary;
