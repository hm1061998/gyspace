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
} from "@/services/api/userDataService";
import { toast } from "@/services/ui/toastService";
import Pagination from "@/components/common/Pagination";

interface SavedVocabularyProps {
  onBack: () => void;
}

const SavedVocabulary: React.FC<SavedVocabularyProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<Idiom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

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
    } catch (e) {
      toast.error("Lỗi khi thực hiện thao tác.");
    }
  };

  const filteredItems = savedItems.filter(
    (item) =>
      item.hanzi.includes(filter) ||
      item.vietnameseMeaning.toLowerCase().includes(filter.toLowerCase())
  );
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.hanzi}
                onClick={() =>
                  navigate(`/?query=${encodeURIComponent(item.hanzi)}`)
                }
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-red-200 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-3xl font-hanzi font-bold text-slate-800">
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
                  {/* <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                  {item.type}
                </span> */}
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
