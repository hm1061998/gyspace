import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
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

const AdminComments: React.FC = () => {
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
          <ChatBubbleIcon className="w-8 h-8 mr-3 text-red-600" />
          Quản lý Góp ý & Bình luận
        </h1>
        <p className="text-slate-600">
          Kiểm duyệt và quản lý các góp ý từ người dùng
        </p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
          <div className="text-slate-600 text-sm mb-1">Tổng số</div>
          <div className="text-3xl font-bold text-slate-800">
            {stats?.total || 0}
          </div>
          {statsLoading && (
            <div className="absolute inset-0 bg-white/50 animate-pulse" />
          )}
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 shadow-sm relative overflow-hidden">
          <div className="text-yellow-700 text-sm mb-1">Chờ duyệt</div>
          <div className="text-3xl font-bold text-yellow-700">
            {stats?.pending || 0}
          </div>
          {statsLoading && (
            <div className="absolute inset-0 bg-yellow-50/50 animate-pulse" />
          )}
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm relative overflow-hidden">
          <div className="text-green-700 text-sm mb-1">Đã duyệt</div>
          <div className="text-3xl font-bold text-green-700">
            {stats?.approved || 0}
          </div>
          {statsLoading && (
            <div className="absolute inset-0 bg-green-50/50 animate-pulse" />
          )}
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 shadow-sm relative overflow-hidden">
          <div className="text-red-700 text-sm mb-1">Từ chối</div>
          <div className="text-3xl font-bold text-red-700">
            {stats?.rejected || 0}
          </div>
          {statsLoading && (
            <div className="absolute inset-0 bg-red-50/50 animate-pulse" />
          )}
        </div>
      </div>
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <form onSubmit={onSearchSubmit} className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm nội dung, người dùng..."
            className="block w-full pl-9 pr-9 py-2.5 h-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm"
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
          className={`flex items-center justify-center gap-2 px-4 h-10 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 border ${
            onlyReported || selectedIdiom
              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <FunnelIcon className="w-4 h-4" />
          <span>Bộ lọc</span>
          {(onlyReported || selectedIdiom) && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-red-600 ml-0.5"></span>
          )}
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-slate-200 mb-4 overflow-x-auto custom-scrollbar">
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
            className={`px-5 py-3 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
              filter === tab.key
                ? "text-red-600 border-red-600 bg-red-50/20"
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedIds([])}
        label="bình luận"
      />

      {/* Select All Checkbox */}
      {!loading && comments.length > 0 && (
        <div className="mb-3 flex items-center gap-2 px-4">
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
            Chọn tất cả ({comments.length} bình luận)
          </label>
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
              className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all"
            >
              Thiết lập lại
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-[2] px-4 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
            >
              Áp dụng bộ lọc
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Idiom Select */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">
              Theo thành ngữ
            </label>
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
            />
          </div>

          {/* Only Reported Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">
              Trạng thái báo cáo
            </label>
            <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-red-200 hover:bg-red-50/30 transition-all group">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  tempOnlyReported
                    ? "bg-red-600 border-red-600"
                    : "bg-white border-slate-300"
                }`}
              >
                {tempOnlyReported && (
                  <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={tempOnlyReported}
                onChange={(e) => setTempOnlyReported(e.target.checked)}
              />
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                Chỉ hiện bình luận bị báo cáo
              </span>
            </label>
          </div>
        </div>
      </Drawer>
      {/* Comments List */}
      {/* Comments List Grid */}
      <div className="bg-slate-50/50 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4" />
            <p className="font-bold text-sm uppercase tracking-wider">
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group flex flex-col relative ${
                  selectedIds.includes(comment.id)
                    ? "border-indigo-400 bg-indigo-50/30"
                    : "border-slate-200 hover:border-red-100"
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-4 right-4 z-10">
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
                <div className="flex items-start justify-between mb-4 pr-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm shadow-inner">
                      {(comment.user.displayName || comment.user.username)
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {comment.user.displayName || comment.user.username}
                        {comment.reportCount > 0 && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] uppercase font-black tracking-wider border border-red-100">
                            <FlagIcon className="w-3 h-3" />
                            {comment.reportCount} report
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <ClockIcon className="w-3 h-3" />
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(comment.status)}</div>
                </div>

                {/* Context Badge */}
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500 font-medium">
                    <span>💬 tại từ:</span>
                    <span className="font-hanzi font-bold text-slate-700">
                      {comment.idiom?.hanzi}
                    </span>
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 mb-5">
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[80px]">
                    {comment.content}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3 bg-white mt-auto">
                  {/* Status Actions */}
                  <div className="flex items-center gap-2">
                    {comment.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(comment.id, "approved")
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition-all"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Duyệt hiển thị</span>
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(comment.id, "rejected")
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all"
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
                        className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 text-xs font-bold rounded-xl border border-orange-100 hover:bg-orange-100 transition-all"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        <span>Ẩn bình luận</span>
                      </button>
                    )}

                    {comment.status === "rejected" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(comment.id, "approved")
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 text-xs font-bold rounded-xl border border-green-100 hover:bg-green-100 transition-all"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Khôi phục</span>
                      </button>
                    )}
                  </div>

                  {/* Destructive Actions */}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="group flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Xóa vĩnh viễn"
                  >
                    <span className="text-[10px] font-bold uppercase hidden group-hover:inline-block">
                      Xóa
                    </span>
                    <TrashIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="p-4 border-t border-slate-100"
      />
    </div>
  );
};

export default AdminComments;
