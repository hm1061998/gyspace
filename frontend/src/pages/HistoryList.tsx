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
import { fetchHistory, clearAllHistory } from "@/services/api/userDataService";
import { modalService } from "@/services/ui/modalService";
import { toast } from "@/services/ui/toastService";
import Pagination from "@/components/common/Pagination";

interface HistoryListProps {
  onBack: () => void;
  onSelect: (idiom: Idiom) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ onBack, onSelect }) => {
  const [historyItems, setHistoryItems] = useState<Idiom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

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

  const filteredItems = historyItems.filter(
    (item) =>
      item.hanzi.toLowerCase().includes(filter.toLowerCase()) ||
      item.pinyin.toLowerCase().includes(filter.toLowerCase()) ||
      item.vietnameseMeaning.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto w-full animate-pop">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center w-full md:w-auto">
          <h1 className="text-2xl font-hanzi font-bold text-slate-800 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-slate-600" />
            Lịch sử tra cứu
          </h1>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Tìm trong lịch sử..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white/50 backdrop-blur-sm"
            />
            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
          </div>
          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-full hover:bg-red-50 hover:text-red-600 transition-colors whitespace-nowrap"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <SpinnerIcon className="w-10 h-10 text-red-600" />
        </div>
      ) : historyItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/40 rounded-3xl border border-slate-100">
          <HistoryIcon className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">Lịch sử trống</p>
          <p className="text-sm">Các từ bạn tra cứu sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {filteredItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => onSelect(item)}
                className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-hanzi font-bold text-slate-800">
                        {item.hanzi}
                      </span>
                      <span className="text-sm text-red-600 font-medium">
                        {item.pinyin}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {item.vietnameseMeaning}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ChevronRightIcon className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && filter && (
              <div className="p-8 text-center text-slate-500">
                Không tìm thấy kết quả nào trong lịch sử.
              </div>
            )}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}
    </div>
  );
};

export default HistoryList;
