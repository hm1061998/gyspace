import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentIcon as FileTextIcon,
  PlusIcon,
  SearchIcon,
  RefreshIcon,
  TrashIcon,
  CloseIcon,
  ListBulletIcon,
} from "@/components/common/icons";
import { examPaperService, ExamPaper } from "@/services/api";
import { toast } from "@/libs/Toast";
import { modalService } from "@/libs/Modal";
import { loadingService } from "@/libs/Loading";
import Pagination from "@/components/common/Pagination";
import Tooltip from "@/components/common/Tooltip";
import Table from "@/components/common/Table";

const ExamPaperManagement: React.FC = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response: any = await examPaperService.getAll({
        page,
        limit: 10,
        search: searchTerm.trim() || undefined,
      });
      // Handle response structure { data: [...], meta: {...} }
      if (response && response.data) {
        setPapers(response.data);
        setLastPage(response.meta?.lastPage || 1);
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPapers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      loadingService.show("Đang tạo bài tập...");
      const newPaper: any = await examPaperService.create(formData);
      toast.success("Đã tạo bài tập mới");
      setIsModalOpen(false);
      setFormData({ title: "", description: "" });
      // Navigate to add question immediately
      navigate(`/admin/exams/${newPaper.id}/questions/new`);
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo bài tập");
    } finally {
      loadingService.hide();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await modalService.danger(
      `Xóa bài tập "${title}"? Hành động này không thể hoàn tác.`,
      "Xác nhận xóa"
    );
    if (!confirmed) return;

    try {
      loadingService.show("Đang xóa...");
      await examPaperService.delete(id);
      toast.success("Đã xóa bài tập");
      fetchPapers();
    } catch (error: any) {
      toast.error("Không thể xóa bài tập");
    } finally {
      loadingService.hide();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <FileTextIcon className="w-8 h-8 text-blue-600" />
            Quản lý Bài Tập
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Danh sách bài tập và câu hỏi
          </p>
        </div>
        <Tooltip content="Thêm bài tập mới" position="left">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 group"
          >
            <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Tạo bài tập
          </button>
        </Tooltip>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          />
          {!!searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg text-slate-400"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={fetchPapers}
          className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors"
        >
          <RefreshIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      <Table<ExamPaper>
        loading={loading}
        data={papers}
        keyExtractor={(item) => item.id}
        emptyMessage="Chưa có bài tập nào"
        columns={[
          {
            header: "Tên Bài Tập",
            cell: (item) => (
              <div>
                <p className="font-black text-slate-800 leading-none mb-1">
                  {item.title}
                </p>
                <p className="text-xs text-slate-400 font-medium line-clamp-1">
                  {item.description}
                </p>
              </div>
            ),
          },
          {
            header: "Ngày tạo",
            cell: (item) => (
              <span className="text-slate-500 text-sm">
                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
              </span>
            ),
          },
          {
            header: "Thao tác",
            className: "text-right",
            cell: (item) => (
              <div className="flex justify-end gap-2">
                <Tooltip content="Quản lý câu hỏi">
                  <button
                    onClick={() => navigate(`/admin/exams/${item.id}`)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </button>
                </Tooltip>
                <Tooltip content="Xóa">
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>
            ),
          },
        ]}
      />

      {/* Pagination component */}
      {!loading && lastPage > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={page}
            totalPages={lastPage}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Modal Create */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-6">
                Tạo bài tập mới
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                    Tên bài tập *
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-medium h-24 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-2xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200"
                  >
                    Tạo ngay
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPaperManagement;
