import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  TrashIcon,
  HistoryIcon,
  SearchIcon,
  ChevronRightIcon,
  SpinnerIcon,
} from "@/components/common/icons";
import type { Idiom } from "@/types";
import {
  fetchHistory,
  clearAllHistory,
  bulkDeleteHistory,
} from "@/services/api/userDataService";
import { modalService } from "@/services/ui/modalService";
import { toast } from "@/services/ui/toastService";
import Pagination from "@/components/common/Pagination";
import BulkActionBar from "@/components/common/BulkActionBar";
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";

interface HistoryListProps {
  onBack: () => void;
  onSelect: (idiom: Idiom) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ onBack, onSelect }) => {
  const [historyItems, setHistoryItems] = useState<Idiom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadHistoryData();
  }, [page]);

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      const response = await fetchHistory(page, 20);
      setHistoryItems(response.data);
      setTotalPages(response.meta.lastPage);
      setTotalItems(response.meta.total);
      setSelectedIds([]); // Clear selection when data changes
    } catch (e) {
      toast.error("Không thể tải lịch sử.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    const confirmed = await modalService.danger(
      "Bạn có chắc chắn muốn xóa toàn bộ lịch sử tra cứu không? Hành động này không thể hoàn tác.",
      "Xóa lịch sử"
    );

    if (confirmed) {
      await clearAllHistory();
      setHistoryItems([]);
      toast.info("Đã xóa lịch sử.");
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

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id!));
    }
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredItems = historyItems.filter(
    (item) =>
      item.hanzi.toLowerCase().includes(filter.toLowerCase()) ||
      item.pinyin.toLowerCase().includes(filter.toLowerCase()) ||
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
              <HistoryIcon className="w-6 h-6 text-slate-600" />
              Lịch sử tra cứu
            </h1>
          </div>

          <div className="flex w-full sm:w-auto gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Tìm trong lịch sử..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 bg-slate-50 transition-all text-sm"
              />
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {historyItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-full hover:bg-red-50 hover:text-red-600 transition-colors whitespace-nowrap uppercase tracking-wider"
              >
                Xóa sạch
              </button>
            )}
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
                Đang tải lịch sử...
              </p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/40 rounded-3xl border border-slate-100 border-dashed">
              <HistoryIcon className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-bold text-slate-300">Lịch sử trống</p>
              <p className="text-xs">
                Các từ bạn tra cứu sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <>
              {/* Bulk Actions Bar */}
              <BulkActionBar
                selectedCount={selectedIds.length}
                onDelete={handleBulkDelete}
                onClearSelection={() => setSelectedIds([])}
                label="mục"
              />

              <SelectAllCheckbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={toggleSelectAll}
                subLabel={`(${filteredItems.length} mục)`}
                className="mb-4"
              />

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                {filteredItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    onClick={() => onSelect(item)}
                    className={`p-4 border-b border-slate-100 last:border-0 cursor-pointer transition-all flex items-center justify-between group ${
                      selectedIds.includes(item.id!)
                        ? "bg-indigo-50/50"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Individual Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id!)}
                        onChange={(e) => toggleSelect(e as any, item.id!)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                      />

                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                        {(page - 1) * 20 + index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-hanzi font-bold text-slate-800 group-hover:text-red-700 transition-colors">
                            {item.hanzi}
                          </span>
                          <span className="text-xs text-red-600 font-bold uppercase tracking-tight">
                            {item.pinyin}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 font-medium italic">
                          {item.vietnameseMeaning}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 && filter && (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                    <SearchIcon className="w-10 h-10 mb-2 opacity-10" />
                    <p className="text-sm italic">
                      Không tìm thấy kết quả nào khớp với "{filter}"
                    </p>
                  </div>
                )}
              </div>
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

export default HistoryList;
