import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChatBubbleIcon,
  HeartIcon,
  PaperAirplaneIcon,
  UserIcon,
  FlagIcon,
  SpinnerIcon,
} from "@/components/common/icons";
import type { Feedback } from "@/types";
import Textarea from "@/components/common/Textarea";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  fetchCommentsByIdiom,
  createComment,
  likeComment,
  reportComment,
  getLikedComments,
  saveLikedComment,
} from "@/services/api/commentService";
import { toast } from "@/libs/Toast";
import { modalService } from "@/libs/Modal";

interface IdiomCommentsProps {
  idiomId: string;
  idiomHanzi: string;
}

const IdiomComments: React.FC<IdiomCommentsProps> = ({
  idiomId,
  idiomHanzi,
}) => {
  const [comments, setComments] = useState<Feedback[]>([]);
  const [meta, setMeta] = useState({ total: 0, lastPage: 1, page: 1 });
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<"createdAt" | "likes">("createdAt");

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setComments([]);
    loadComments(1, true);
    setLikedComments(getLikedComments());
  }, [idiomId, sortBy]);

  const loadComments = async (page: number, refresh = false) => {
    if (page === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const response = await fetchCommentsByIdiom(
        idiomId,
        page,
        10,
        sortBy,
        "DESC"
      );

      if (refresh) {
        setComments(response.data);
      } else {
        setComments((prev) => [...prev, ...response.data]);
      }
      setMeta(response.meta);
    } catch (error) {
      console.error("Error loading comments", error);
      toast.error("Không thể tải bình luận.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (meta.page < meta.lastPage) {
      loadComments(meta.page + 1);
    }
  };

  const handleLike = async (commentId: string) => {
    if (likedComments.includes(commentId)) return;
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để bình chọn.");
      return;
    }

    try {
      const updatedComment = await likeComment(commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c))
      );
      saveLikedComment(commentId);
      setLikedComments((prev) => [...prev, commentId]);
    } catch (error) {
      console.error("Error liking comment", error);
    }
  };

  const handleReport = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để báo cáo.");
      return;
    }

    const confirmed = await modalService.confirm(
      "Báo cáo bình luận này vi phạm quy tắc cộng đồng?",
      "Xác nhận báo cáo"
    );

    if (confirmed) {
      try {
        await reportComment(commentId);
        toast.success("Cảm ơn đóng góp của bạn. Chúng tôi sẽ sớm kiểm tra!");
      } catch (error) {
        console.error("Error reporting comment", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newComment.trim() ||
      !isAuthenticated ||
      isSubmitting ||
      newComment.length < 5
    )
      return;

    setIsSubmitting(true);
    try {
      await createComment({
        content: newComment,
        idiomId: idiomId,
      });

      setNewComment("");
      toast.success("Cảm ơn bạn! Bình luận đã được gửi và đang chờ phê duyệt.");

      // Refresh current page 1
      loadComments(1, true);
    } catch (error: any) {
      console.error("Error saving comment", error);
      toast.error(error.message || "Gửi bình luận thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const totalLikes = useMemo(() => {
    return comments.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  }, [comments]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-[fadeInUp_0.4s_ease-out]">
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-0">
        <div className="space-y-1 md:space-y-2">
          <h3 className="text-2xl md:text-3xl font-hanzi font-black text-slate-800 flex items-center gap-2 md:gap-3">
            <span className="w-1 md:w-1.5 h-6 md:h-8 bg-red-600 rounded-full"></span>
            Thảo luận
          </h3>
          <p className="text-slate-500 text-sm md:text-base font-medium">
            Chia sẻ kiến thức về cụm từ{" "}
            <span className="text-red-600 font-bold">"{idiomHanzi}"</span>
          </p>
        </div>

        <div className="flex items-center gap-3 md:gap-6 bg-white/50 backdrop-blur-md p-1.5 md:p-2 rounded-2xl border border-slate-200/50 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className="px-3 md:px-4 py-1.5 md:py-2 text-center border-r border-slate-100 shrink-0">
            <span className="block text-xl md:text-2xl font-black text-slate-800 leading-none">
              {meta.total}
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Bình luận
            </span>
          </div>
          <div className="px-3 md:px-4 py-1.5 md:py-2 text-center shrink-0">
            <span className="block text-xl md:text-2xl font-black text-slate-800 leading-none">
              {totalLikes}
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Tương tác
            </span>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setSortBy("createdAt")}
              className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                sortBy === "createdAt"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy("likes")}
              className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                sortBy === "likes"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Phổ biến
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-7">
        {/* Main Content Area */}
        <div className="xl:col-span-8 order-2 xl:order-1 space-y-4 md:space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 bg-white/50 rounded-[2rem] border border-dashed border-slate-200">
              <SpinnerIcon className="w-8 h-8 md:w-10 md:h-10 text-red-600 mb-4 animate-spin" />
              <p className="text-slate-400 text-xs md:text-sm font-medium animate-pulse">
                Đang tải thảo luận...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 bg-white/50 rounded-[2rem] border border-dashed border-slate-200 text-center px-6 md:px-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <ChatBubbleIcon className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
              </div>
              <h4 className="text-lg md:text-xl font-bold text-slate-700 mb-2">
                Chưa có bình luận
              </h4>
              <p className="text-slate-400 text-sm max-w-sm mb-0">
                Hãy là người đầu tiên chia sẻ kiến thức của bạn về cụm từ này!
              </p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {comments.map((comment, idx) => {
                const isLiked = likedComments.includes(comment.id);
                const isTop =
                  sortBy === "likes" && idx < 3 && comment.likes >= 5;

                return (
                  <div
                    key={comment.id}
                    className={`group bg-white p-4 md:p-6 rounded-[2rem] border border-slate-100 transition-all ${
                      isTop
                        ? "ring-2 ring-amber-100 bg-amber-50/10"
                        : "hover:border-red-100"
                    }`}
                  >
                    <div className="flex gap-3 md:gap-4">
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-xs md:text-sm font-black shadow-md shrink-0 ${
                          comment.user.isAdmin
                            ? "bg-gradient-to-br from-indigo-600 to-purple-600"
                            : "bg-gradient-to-br from-red-500 to-rose-600"
                        }`}
                      >
                        {comment.user.displayName?.charAt(0) ||
                          comment.user.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-2 md:mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold md:font-black text-slate-800 text-sm md:text-base">
                              {comment.user.displayName ||
                                comment.user.username}
                            </span>
                            {comment.user.isAdmin && (
                              <span className="text-[8px] md:text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full border border-indigo-100 font-black uppercase">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] md:text-xs font-semibold text-slate-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>

                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words text-sm md:text-[15px] font-medium mb-4 md:mb-6">
                          {comment.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleLike(comment.id)}
                              disabled={isLiked}
                              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black transition-all ${
                                isLiked
                                  ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                                  : "bg-slate-50 text-slate-500 active:scale-90"
                              }`}
                            >
                              <HeartIcon
                                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                                  isLiked ? "fill-current" : ""
                                }`}
                                filled={isLiked}
                              />
                              {comment.likes || 0}
                            </button>

                            {isTop && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-black flex items-center gap-1 uppercase">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                </svg>{" "}
                                Top
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleReport(comment.id)}
                            className="p-2 text-slate-300 hover:text-red-600 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                          >
                            <FlagIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {meta.page < meta.lastPage && (
                <div className="pt-4 md:pt-6 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white border border-slate-200 text-slate-600 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:border-red-300 transition-all shadow-sm active:scale-95 group"
                  >
                    {isLoadingMore ? (
                      <SpinnerIcon className="w-4 h-4 md:w-5 md:h-5 animate-spin text-red-600" />
                    ) : (
                      <>
                        <span>Xem thêm</span>
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-y-0.5 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area - Mobile top priority */}
        <div className="xl:col-span-4 order-1 xl:order-2">
          <div className="xl:sticky xl:top-24 space-y-4 md:space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 rounded-full blur-3xl"></div>

              {isAuthenticated ? (
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 md:mb-5">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <h4 className="text-base md:text-lg font-black tracking-tight">
                      Để lại bình luận
                    </h4>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-3 md:space-y-4"
                  >
                    <div className="relative">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Chia sẻ ý kiến của bạn..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl md:rounded-2xl min-h-[100px] md:min-h-[140px] p-4 md:p-5 text-sm md:text-base focus:ring-red-500/50 focus:border-red-500 transition-all"
                        disabled={isSubmitting}
                      />
                      <div className="absolute bottom-3 left-4">
                        <span
                          className={`text-[9px] font-bold ${
                            newComment.length > 0 && newComment.length < 5
                              ? "text-amber-400"
                              : "text-white"
                          }`}
                        >
                          {newComment.length} / 5
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !newComment.trim() ||
                        newComment.length < 5 ||
                        isSubmitting
                      }
                      className="w-full h-12 md:h-14 bg-red-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 font-black text-xs md:text-sm hover:bg-red-700 transition-all active:scale-95 disabled:bg-white/10"
                    >
                      {isSubmitting ? (
                        <SpinnerIcon className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Gửi ngay</span>
                          <PaperAirplaneIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="relative z-10 text-center py-2">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-6 h-6 text-white/40" />
                  </div>
                  <h4 className="text-lg font-black mb-2">
                    Tiếp tục thảo luận?
                  </h4>
                  <p className="text-white/50 text-xs md:text-sm mb-6 font-medium px-4">
                    Đăng nhập để tham gia thảo luận cùng cộng đồng GYSpace.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/auth")}
                    className="w-full h-12 bg-white text-slate-900 rounded-xl font-black text-xs hover:bg-red-50 transition-all"
                  >
                    Đăng nhập
                  </button>
                </div>
              )}
            </div>

            {/* Rules - Hidden on small mobile to save vertical space */}
            <div className="hidden sm:block bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm md:text-base">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-7.618 3.04z"
                  />
                </svg>
                Quy tắc
              </h4>
              <ul className="space-y-2 md:space-y-3">
                {[
                  "Tôn trọng và lịch sự với cộng đồng.",
                  "Nội dung tập trung vào học thuật.",
                  "Không quảng cáo hoặc spam.",
                ].map((rule, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed"
                  >
                    <span className="text-red-500 font-black">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdiomComments;
