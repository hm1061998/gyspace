import React, { useState, useEffect } from "react";
import {
  ChatBubbleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  FlagIcon,
} from "@/components/common/icons";
import type { Feedback } from "@/types";
import {
  fetchAllComments,
  fetchCommentStats,
  updateCommentStatus,
  deleteComment,
  type CommentStats,
} from "@/services/api/commentService";
import { toast } from "@/services/ui/toastService";
import { modalService } from "@/services/ui/modalService";
import Pagination from "@/components/common/Pagination";

const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<CommentStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadComments();
  }, [filter, page]);

  const loadStats = async () => {
    try {
      const data = await fetchCommentStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats", error);
    }
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (filter !== "all") {
        params.status = filter;
      }

      const response = await fetchAllComments(params);
      setComments(response.data);
      setTotalPages(response.totalPages);
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
      await loadStats();
    } catch (error: any) {
      alert(
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
      await loadComments();
      await loadStats();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa bình luận. Vui lòng thử lại."
      );
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-slate-600 text-sm mb-1">Tổng số</div>
          <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 shadow-sm">
          <div className="text-yellow-700 text-sm mb-1">Chờ duyệt</div>
          <div className="text-3xl font-bold text-yellow-700">
            {stats.pending}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm">
          <div className="text-green-700 text-sm mb-1">Đã duyệt</div>
          <div className="text-3xl font-bold text-green-700">
            {stats.approved}
          </div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 shadow-sm">
          <div className="text-red-700 text-sm mb-1">Từ chối</div>
          <div className="text-3xl font-bold text-red-700">
            {stats.rejected}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex border-b border-slate-200">
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
              className={`px-6 py-3 font-medium transition-colors ${
                filter === tab.key
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Comments List */}
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Đang tải...</div>
          ) : comments.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Không có bình luận nào
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-slate-800">
                        {comment.user.displayName || comment.user.username}
                      </span>
                      {getStatusBadge(comment.status)}
                      {comment.reportCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                          <FlagIcon className="w-3 h-3 mr-1" />
                          {comment.reportCount} báo cáo
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mb-1">
                      Thành ngữ:{" "}
                      <span className="font-hanzi font-bold">
                        {comment.idiom?.hanzi}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 whitespace-pre-wrap break-words bg-slate-50 p-3 rounded-lg">
                  {comment.content}
                </p>

                <div className="flex items-center gap-2">
                  {comment.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(comment.id, "approved")
                        }
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Duyệt
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(comment.id, "rejected")
                        }
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Từ chối
                      </button>
                    </>
                  )}
                  {comment.status === "approved" && (
                    <button
                      onClick={() => handleUpdateStatus(comment.id, "rejected")}
                      className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Gỡ xuống
                    </button>
                  )}
                  {comment.status === "rejected" && (
                    <button
                      onClick={() => handleUpdateStatus(comment.id, "approved")}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Duyệt lại
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-2 ml-auto"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
            ))
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
    </div>
  );
};

export default AdminComments;
