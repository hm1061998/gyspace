import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowLeftIcon,
  SpinnerIcon,
  SearchIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "../components/icons";
import { fetchStoredIdioms, deleteIdiom } from "../services/idiomService";
import { Idiom } from "../types";
import { useNavigate } from "react-router";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface VocabularyListProps {
  onBack: () => void;
  onSelect: (idiomHanzi: string) => void;
  onEdit: (id: string) => void;
}

const VocabularyList: React.FC<VocabularyListProps> = ({
  onBack,
  onSelect,
  onEdit,
}) => {
  const navigate = useNavigate();

  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    hanzi: string;
  }>({
    isOpen: false,
    id: "",
    hanzi: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  // Filter State
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filter]);

  useEffect(() => {
    loadIdioms();
  }, [page, debouncedFilter]);

  const loadIdioms = async () => {
    setLoading(true);
    try {
      const response = await fetchStoredIdioms(page, 12, debouncedFilter);
      setIdioms(response.data);
      setTotalPages(response.meta.lastPage);
      setTotalItems(response.meta.total);
    } catch (err) {
      setError("Không thể tải danh sách từ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    hanzi: string
  ) => {
    e.stopPropagation();
    // if (window.confirm(`Bạn có chắc chắn muốn xóa từ "${hanzi}" không?`)) {
    //   try {
    //     await deleteIdiom(id);
    //     loadIdioms(); // Reload list after deletion
    //   } catch (err: any) {
    //     alert("Lỗi khi xóa: " + err.message);
    //   }
    // }
    setDeleteModal({ isOpen: true, id, hanzi });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteIdiom(deleteModal.id);
      setDeleteModal({ ...deleteModal, isOpen: false });
      loadIdioms(); // Reload list after deletion
    } catch (err: any) {
      alert("Lỗi khi xóa: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onEdit(id);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  return (
    <div className="max-w-6xl w-full mx-auto animate-pop">
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        idiomHanzi={deleteModal.hanzi}
        isDeleting={isDeleting}
        onClose={() =>
          !isDeleting && setDeleteModal({ ...deleteModal, isOpen: false })
        }
        onConfirm={confirmDelete}
      />
      <div className="flex flex-row justify-between items-center gap-4">
        <div className="flex items-center w-auto">
          <h1 className="text-2xl font-hanzi font-bold text-slate-800">
            Kho từ vựng ({totalItems})
          </h1>
        </div>

        <button
          onClick={() => {
            navigate("/admin/insert");
          }}
          className="flex items-center justify-between p-3.5 bg-red-50 hover:bg-red-100 rounded-xl transition-all group border border-red-100"
        >
          <div className="flex items-center space-x-3 text-red-700 font-bold">
            <PlusIcon className="w-5 h-5" /> <span>Thêm mới</span>
          </div>
        </button>
      </div>

      <div className="relative w-full md:w-80 my-5">
        <input
          type="text"
          placeholder="Tìm từ vựng..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-200"
        />
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <SpinnerIcon className="w-8 h-8 text-red-600" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : idioms.length === 0 ? (
        <div className="text-center text-slate-400 py-20">
          <p>Không tìm thấy kết quả phù hợp.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {idioms.map((item) => (
              <div
                key={item.id}
                onClick={() => onEdit(item.id)}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-hanzi font-bold text-slate-800 group-hover:text-red-700">
                    {item.hanzi}
                  </h2>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleEdit(e, item.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Sửa"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, item.id, item.hanzi)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-red-500 font-medium text-sm mb-2">
                  {item.pinyin}
                </p>
                <p className="text-slate-600 text-sm line-clamp-2">
                  {item.vietnameseMeaning}
                </p>
                {/* {item.level && (
                  <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                    <span>{item.level}</span>
                    <span>{item.source}</span>
                  </div>
                )} */}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-4 border-t border-slate-100">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`flex items-center px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                  page === 1
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-red-300"
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Trang trước
              </button>

              <span className="text-slate-500 font-bold text-sm">
                Trang {page} / {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`flex items-center px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                  page === totalPages
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-red-300"
                }`}
              >
                Trang sau
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VocabularyList;
