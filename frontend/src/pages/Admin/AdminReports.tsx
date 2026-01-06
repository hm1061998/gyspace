import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  ExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  SearchIcon,
  CloseIcon,
  FunnelIcon,
  SpinnerIcon,
} from "@/components/common/icons";
import {
  getAllReports,
  updateReport,
  deleteReport,
  DictionaryReport,
} from "@/services/api/reportService";
import { modalService } from "@/libs/Modal";
import { toast } from "@/libs/Toast";
import Pagination from "@/components/common/Pagination";
import Drawer from "@/components/common/Drawer";

const REPORT_TYPES = [
  { value: "content_error", label: "Sai nội dung" },
  { value: "audio_error", label: "Lỗi âm thanh" },
  { value: "missing_info", label: "Thiếu thông tin" },
  { value: "other", label: "Lỗi khác" },
];

const AdminReports: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [reports, setReports] = useState<DictionaryReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [statusFilter, typeFilter, page]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await getAllReports({
        page,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setReports(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalCount(response.meta.total);
    } catch (error) {
      console.error("Error loading reports", error);
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    reportId: string,
    status: string,
    adminNote?: string
  ) => {
    setIsUpdating(reportId);
    try {
      await updateReport(reportId, { status: status as any, adminNote });
      toast.success("Đã cập nhật trạng thái báo cáo");
      await loadReports();
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    const confirmed = await modalService.danger(
      "Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác.",
      "Xác nhận xóa"
    );
    if (!confirmed) return;

    try {
      await deleteReport(reportId);
      toast.success("Đã xóa báo cáo");
      await loadReports();
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const openNoteModal = async (report: DictionaryReport, newStatus: string) => {
    const note = window.prompt(
      "Nhập phản hồi cho người dùng (tùy chọn):",
      report.adminNote || ""
    );
    if (note !== null) {
      await handleUpdateStatus(report.id, newStatus, note);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <span className="inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-green-100 text-green-700 border border-green-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Đã xử lý
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-red-100 text-red-700 border border-red-200">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Từ chối
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200">
            <SpinnerIcon className="w-3 h-3 mr-1" />
            Đang xử lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-yellow-100 text-yellow-700 border border-yellow-200">
            <ClockIcon className="w-3 h-3 mr-1" />
            Chờ duyệt
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    return REPORT_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 -ml-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                  title="Quay lại"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800 flex items-center">
                  <ExclamationIcon className="w-5 h-5 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-600 shrink-0" />
                  <span className="truncate">Báo lỗi từ điển</span>
                </h1>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">
                  Kiểm duyệt và phản hồi các báo cáo lỗi từ người dùng
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <div className="px-2 py-0.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  T
                </span>
                <span className="text-xs font-black text-slate-700">
                  {totalCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-2 mb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                loadReports();
              }}
              className="relative flex-1 group"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm nội dung báo cáo..."
                className="block w-full pl-9 pr-9 h-10 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <CloseIcon className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                </button>
              )}
            </form>

            <button
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 h-10 rounded-xl font-bold text-sm transition-all active:scale-95 border shrink-0 ${
                typeFilter !== "all"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Bộ lọc</span>
              {typeFilter !== "all" && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-600 ml-0.5"></span>
              )}
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ duyệt" },
              { key: "processing", label: "Đang xử lý" },
              { key: "resolved", label: "Đã xong" },
              { key: "rejected", label: "Từ chối" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-[10px] font-black transition-all rounded-lg border-b-2 whitespace-nowrap ${
                  statusFilter === tab.key
                    ? "text-red-700 border-red-700 bg-red-50/50"
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <SpinnerIcon className="w-10 h-10 animate-spin mb-4" />
              <p className="font-black text-xs uppercase tracking-widest">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-4xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                <ExclamationIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800">
                Không tìm thấy báo cáo
              </h3>
              <p className="text-slate-500 mt-2 font-medium">
                Hiện tại không có báo cáo nào khớp với bộ lọc của bạn.
              </p>
              {(statusFilter !== "all" ||
                typeFilter !== "all" ||
                searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-6 text-red-600 font-black text-sm uppercase tracking-widest hover:underline"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-3xl sm:rounded-4xl border border-slate-100 p-5 sm:p-7 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <ExclamationIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-0.5">
                          {getTypeLabel(report.type)}
                        </span>
                        <h4 className="font-hanzi font-black text-lg text-slate-800 tracking-tight">
                          {report.idiom?.hanzi}
                        </h4>
                      </div>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="bg-slate-50/50 rounded-2xl p-4 mb-4 border border-slate-100 flex-1">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {report.description}
                    </p>
                  </div>

                  {report.adminNote && (
                    <div className="mb-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
                        Phản hồi từ Admin:
                      </p>
                      <p className="text-xs font-bold text-emerald-700 italic">
                        "{report.adminNote}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-800 truncate">
                        Bởi: {report.user?.displayName || report.user?.username}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        {formatDate(report.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status !== "resolved" && (
                        <button
                          onClick={() => openNoteModal(report, "resolved")}
                          disabled={isUpdating === report.id}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg hover:bg-emerald-700 transition-all uppercase tracking-widest shadow-lg shadow-emerald-100"
                        >
                          Xử lý xong
                        </button>
                      )}
                      {report.status === "pending" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(report.id, "processing")
                          }
                          disabled={isUpdating === report.id}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg shadow-indigo-100"
                        >
                          Đang xem
                        </button>
                      )}
                      {report.status !== "rejected" &&
                        report.status !== "resolved" && (
                          <button
                            onClick={() => openNoteModal(report, "rejected")}
                            disabled={isUpdating === report.id}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest"
                          >
                            Từ chối
                          </button>
                        )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Bộ lọc báo cáo"
        footer={
          <button
            onClick={() => {
              setStatusFilter("all");
              setTypeFilter("all");
              setIsFilterOpen(false);
            }}
            className="w-full py-3 bg-white border-2 border-slate-100 text-slate-400 text-xs font-black rounded-xl hover:border-slate-200 uppercase tracking-widest transition-all"
          >
            Thiết lập lại
          </button>
        }
      >
        <div className="space-y-8 py-4">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Loại lỗi
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-3 rounded-xl border-2 text-left transition-all text-xs font-black uppercase tracking-widest ${
                  typeFilter === "all"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-50 bg-white text-slate-400"
                }`}
              >
                Tất cả loại lỗi
              </button>
              {REPORT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTypeFilter(t.value)}
                  className={`px-4 py-3 rounded-xl border-2 text-left transition-all text-xs font-black uppercase tracking-widest ${
                    typeFilter === t.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-50 bg-white text-slate-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default AdminReports;
