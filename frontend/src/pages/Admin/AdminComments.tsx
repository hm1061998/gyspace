import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ChatBubbleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  FlagIcon,
  SearchIcon,
  CloseIcon,
  FunnelIcon,
} from "@/components/common/icons";
import type { Feedback } from "@/types";
import {
  fetchAllComments,
  updateCommentStatus,
  deleteComment,
  bulkDeleteComments,
} from "@/services/api/commentService";
import { fetchSuggestions, fetchIdiomById } from "@/services/api/idiomService";
import { modalService } from "@/services/ui/modalService";
import { toast } from "@/services/ui/toastService";
import Pagination from "@/components/common/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getCommentStats } from "@/redux/adminSlice";
import FormSelect from "@/components/common/FormSelect";
import Drawer from "@/components/common/Drawer";
import BulkActionBar from "@/components/common/BulkActionBar";
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";

const AdminComments: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { commentStats: stats, commentLoading: statsLoading } = useSelector(
    (state: RootState) => state.admin
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const idiomIdParam = searchParams.get("idiomId");
  const onlyReportedParam = searchParams.get("onlyReported") === "true";

  const [comments, setComments] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // New filters
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyReported, setOnlyReported] = useState(false);
  const [selectedIdiom, setSelectedIdiom] = useState<any>(null);
  const [idiomSearchText, setIdiomSearchText] = useState("");
  const [idiomSuggestions, setIdiomSuggestions] = useState<any[]>([]);
  const [idiomSuggestionsPage, setIdiomSuggestionsPage] = useState(1);
  const [hasMoreIdioms, setHasMoreIdioms] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Temporary states for Drawer
  const [tempSelectedIdiom, setTempSelectedIdiom] = useState<any>(null);
  const [tempOnlyReported, setTempOnlyReported] = useState(false);

  // Nếu có idiomId từ URL, mặc định xem 'all' status của thành ngữ đó và fetch chi tiết
  useEffect(() => {
    if (idiomIdParam) {
      setFilter("all");
      void loadSelectedIdiom(idiomIdParam);
    } else {
      setSelectedIdiom(null);
    }

    if (onlyReportedParam) {
      setOnlyReported(true);
    }
  }, [idiomIdParam, onlyReportedParam]);

  const loadSelectedIdiom = async (id: string) => {
    try {
      const data = await fetchIdiomById(id);
      setSelectedIdiom(data);
    } catch (err) {
      console.error("Failed to fetch idiom details", err);
    }
  };

  // Search idioms for select
  useEffect(() => {
    const timer = setTimeout(() => {
      setIdiomSuggestionsPage(1);
      void searchIdioms(idiomSearchText, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [idiomSearchText]);

  useEffect(() => {
    if (idiomSuggestionsPage > 1) {
      void searchIdioms(idiomSearchText, idiomSuggestionsPage);
    }
  }, [idiomSuggestionsPage]);

  const searchIdioms = async (query: string, page: number) => {
    // Actually we want to show loading spinner in dropdown for "load more" too
    setLoadingSuggestions(true);
    try {
      // API now supports pagination: fetchSuggestions(query, page)
      const { data, meta } = await fetchSuggestions(query, page);

      if (page === 1) {
        setIdiomSuggestions(data);
      } else {
        setIdiomSuggestions((prev) => [...prev, ...data]);
      }
      setHasMoreIdioms(meta.hasMore);
    } catch (err) {
      console.error("Lỗi tìm kiếm thành ngữ:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleLoadMoreSuggestions = () => {
    if (hasMoreIdioms && !loadingSuggestions) {
      setIdiomSuggestionsPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    dispatch(getCommentStats(false));
  }, [dispatch]);

  // Sync effect: load comments whenever filter keys change
  // Note: we don't include searchQuery here to avoid excessive API calls while typing
  // User should press Enter or click 'Filter' for search
  useEffect(() => {
    loadComments();
  }, [filter, page, onlyReported, selectedIdiom]);

  const openFilterDrawer = () => {
    setTempSelectedIdiom(selectedIdiom);
    setTempOnlyReported(onlyReported);
    setIsFilterOpen(true);
  };

  const handleApplyFilters = () => {
    setSelectedIdiom(tempSelectedIdiom);
    setOnlyReported(tempOnlyReported);
    if (tempSelectedIdiom) {
      setSearchParams({ idiomId: tempSelectedIdiom.id });
    } else {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("idiomId");
        return newParams;
      });
    }

    // Handle onlyReported param
    if (tempOnlyReported) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("onlyReported", "true");
        return newParams;
      });
    } else {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("onlyReported");
        return newParams;
      });
    }

    setPage(1);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setTempSelectedIdiom(null);
    setTempOnlyReported(false);
  };

  // Handle Search on Enter or Button Click
  const onSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    loadComments();
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (filter !== "all") {
        params.status = filter;
      }

      // Ưu tiên idiomId từ state (Select) hoặc URL
      const currentIdiomId = selectedIdiom?.id || idiomIdParam;
      if (currentIdiomId) {
        params.idiomId = currentIdiomId;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (onlyReported) {
        params.onlyReported = true;
      }

      const response = await fetchAllComments(params);
      setComments(response.data);
      setTotalPages(response.totalPages);
      setSelectedIds([]); // Clear selection when data changes
    } catch (error) {
      console.error("Error loading comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    commentId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await updateCommentStatus(commentId, status);
      await loadComments();
      dispatch(getCommentStats(true));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái. Vui lòng thử lại."
      );
    }
  };

  const handleDelete = async (commentId: string) => {
    const confirmed = await modalService.danger(
      "Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.",
      "Xác nhận xóa"
    );
    if (!confirmed) return;

    try {
      await deleteComment(commentId);
      toast.success("Đã xóa bình luận thành công");
      await loadComments();
      dispatch(getCommentStats(true));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Không thể xóa bình luận. Vui lòng thử lại."
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một bình luận để xóa");
      return;
    }

    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} bình luận đã chọn không? Hành động này không thể hoàn tác.`,
      "Xác nhận xóa"
    );

    if (!confirmed) return;

    try {
      await bulkDeleteComments(selectedIds);
      toast.success(`Đã xóa ${selectedIds.length} bình luận thành công`);
      await loadComments();
      dispatch(getCommentStats(true));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Xóa thất bại. Vui lòng thử lại."
      );
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comments.map((comment) => comment.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected =
    comments.length > 0 && selectedIds.length === comments.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < comments.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
            <ClockIcon className="w-3 h-3 mr-1" />
            Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Fixed Top Section: Header, Stats, Tabs, Toolbar */}
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
                  <ChatBubbleIcon className="w-5 h-5 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-600 shrink-0" />
                  <span className="truncate">Góp ý</span>
                </h1>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">
                  Kiểm duyệt và quản lý các góp ý từ người dùng
                </p>
              </div>
            </div>

            {/* Quick Stats inside title row on mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <div className="px-2 py-0.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  T
                </span>
                <span className="text-xs font-black text-slate-700">
                  {stats?.total || 0}
                </span>
              </div>
              <div className="px-2 py-0.5 bg-yellow-50 rounded-lg border border-yellow-100 flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-yellow-600 uppercase">
                  W
                </span>
                <span className="text-xs font-black text-yellow-700">
                  {stats?.pending || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar - Row on mobile */}
          <div className="flex items-center gap-2 mb-3">
            <form onSubmit={onSearchSubmit} className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm..."
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
              onClick={openFilterDrawer}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 h-10 rounded-xl font-bold text-sm transition-all active:scale-95 border shrink-0 ${
                onlyReported || selectedIdiom
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Bộ lọc</span>
              {(onlyReported || selectedIdiom) && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-600 ml-0.5"></span>
              )}
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ duyệt" },
              { key: "approved", label: "Đã duyệt" },
              { key: "rejected", label: "Từ chối" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setFilter(tab.key as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-[10px] font-black transition-all rounded-lg border-b-2 ${
                  filter === tab.key
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

      {/* Middle Section: Scrollable List */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-2">
          <BulkActionBar
            selectedCount={selectedIds.length}
            onDelete={handleBulkDelete}
            onClearSelection={() => setSelectedIds([])}
            label="bình luận"
          />

          <SelectAllCheckbox
            checked={isAllSelected}
            indeterminate={isSomeSelected}
            onChange={toggleSelectAll}
            subLabel={`(${comments.length} bình luận trong trang này)`}
            className="mb-4"
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4" />
              <p className="font-bold text-xs uppercase tracking-wider">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ChatBubbleIcon className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-500">Chưa có bình luận nào</p>
              <p className="text-xs mt-1">
                Thử thay đổi bộ lọc tìm kiếm xem sao!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-20">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group flex flex-col relative ${
                    selectedIds.includes(comment.id)
                      ? "border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-50"
                      : "border-slate-100 hover:border-red-100"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(comment.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(comment.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                    />
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shadow-inner shrink-0">
                        {(comment.user.displayName || comment.user.username)
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm flex flex-wrap items-center gap-2">
                          {comment.user.displayName || comment.user.username}
                          {comment.reportCount > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] uppercase font-black tracking-wider border border-red-100">
                              <FlagIcon className="w-3 h-3" />
                              {comment.reportCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <ClockIcon className="w-3 h-3" />
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(comment.status)}
                    </div>
                  </div>

                  {/* Context Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                      <span>tại:</span>
                      <span className="font-hanzi font-black text-slate-800">
                        {comment.idiom?.hanzi}
                      </span>
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 mb-5">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[80px]">
                      {comment.content}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-2 mt-auto">
                    <div className="flex items-center gap-2">
                      {comment.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(comment.id, "approved")
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-[11px] font-black rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 hover:-translate-y-0.5 transition-all uppercase tracking-wider"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Duyệt</span>
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(comment.id, "rejected")
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-[11px] font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-wider"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            <span>Từ chối</span>
                          </button>
                        </>
                      )}

                      {comment.status === "approved" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(comment.id, "rejected")
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 text-[11px] font-black rounded-xl border border-orange-100 hover:bg-orange-100 transition-all uppercase tracking-wider"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          <span>Ẩn đi</span>
                        </button>
                      )}

                      {comment.status === "rejected" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(comment.id, "approved")
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 text-[11px] font-black rounded-xl border border-green-100 hover:bg-green-100 transition-all uppercase tracking-wider"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Khôi phục</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Xóa vĩnh viễn"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      {totalPages > 1 && (
        <div className="flex-none bg-white border-t border-slate-200 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Filter Drawer Overlay */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Bộ lọc nâng cao"
        footer={
          <>
            <button
              onClick={handleResetFilters}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 text-[11px] font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Thiết lập lại
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-[2] px-4 py-3 bg-slate-900 text-white text-[11px] font-black rounded-xl hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-[0.95] uppercase tracking-widest"
            >
              Áp dụng bộ lọc
            </button>
          </>
        }
      >
        <div className="space-y-8 py-4">
          {/* Idiom Select */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Theo thành ngữ
            </h4>
            <FormSelect
              placeholder="Tìm thành ngữ..."
              searchable
              value={tempSelectedIdiom?.id || ""}
              options={[
                ...(tempSelectedIdiom
                  ? [
                      {
                        value: tempSelectedIdiom.id,
                        label: tempSelectedIdiom.hanzi,
                      },
                    ]
                  : []),
                { value: "all", label: "-- Tất cả --" },
                ...idiomSuggestions
                  .filter((i) => i.id !== tempSelectedIdiom?.id)
                  .map((item) => ({
                    value: item.id,
                    label: `${item.hanzi} (${item.pinyin})`,
                  })),
              ]}
              onChange={(val) => {
                if (val === "all") {
                  setTempSelectedIdiom(null);
                } else {
                  const item =
                    idiomSuggestions.find((i) => i.id === val) ||
                    (tempSelectedIdiom?.id === val ? tempSelectedIdiom : null);
                  if (item) setTempSelectedIdiom(item);
                }
                setIdiomSearchText(""); // reset search text
              }}
              searchValue={idiomSearchText}
              onSearchChange={setIdiomSearchText}
              onLoadMore={handleLoadMoreSuggestions}
              loading={loadingSuggestions}
              className="!bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          {/* Only Reported Toggle */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Trạng thái báo cáo
            </h4>
            <label className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 cursor-pointer hover:border-red-200 hover:bg-red-50/50 transition-all group">
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                  tempOnlyReported
                    ? "bg-red-600 border-red-600 shadow-lg shadow-red-100"
                    : "bg-white border-slate-300"
                }`}
              >
                {tempOnlyReported && (
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                )}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={tempOnlyReported}
                onChange={(e) => setTempOnlyReported(e.target.checked)}
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                Chỉ hiện bình luận bị báo cáo
              </span>
            </label>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default AdminComments;
