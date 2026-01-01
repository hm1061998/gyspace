import React, { useState, useEffect, useRef } from "react";
import {
  ChatBubbleIcon,
  HeartIcon,
  PaperAirplaneIcon,
  UserIcon,
  FlagIcon,
} from "./icons";
import type { Feedback } from "@/types";
import Textarea from "@/components/Textarea";

interface IdiomCommentsProps {
  idiomHanzi: string;
  isLoggedIn: boolean;
  isPremium: boolean;
}

const IdiomComments: React.FC<IdiomCommentsProps> = ({
  idiomHanzi,
  isLoggedIn,
  isPremium,
}) => {
  const [comments, setComments] = useState<Feedback[]>([]);
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [reportNotification, setReportNotification] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
    loadUserLikes();
  }, [idiomHanzi]);

  const loadUserLikes = () => {
    try {
      const storedLikes = localStorage.getItem("user_liked_comments");
      if (storedLikes) {
        setLikedComments(JSON.parse(storedLikes));
      }
    } catch (e) {
      console.error("Error loading user likes", e);
    }
  };

  const loadComments = () => {
    try {
      const stored = localStorage.getItem("public_feedbacks");
      if (stored) {
        const allFeedbacks: Feedback[] = JSON.parse(stored);
        // Filter feedbacks for this specific idiom
        const relevant = allFeedbacks.filter(
          (f) => f.idiomHanzi === idiomHanzi
        );
        // Sort by timestamp new to old
        setComments(relevant.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setComments([]);
      }
    } catch (e) {
      console.error("Error loading comments", e);
    }
  };

  const handleLike = (commentId: string) => {
    // Check if already liked
    if (likedComments.includes(commentId)) return;

    try {
      const stored = localStorage.getItem("public_feedbacks");
      let allFeedbacks: Feedback[] = stored ? JSON.parse(stored) : [];

      // Update the specific comment's like count
      const updatedFeedbacks = allFeedbacks.map((f) => {
        if (f.id === commentId) {
          return { ...f, likes: (f.likes || 0) + 1 };
        }
        return f;
      });

      // Save global feedbacks
      localStorage.setItem(
        "public_feedbacks",
        JSON.stringify(updatedFeedbacks)
      );

      // Save user like history
      const newUserLikes = [...likedComments, commentId];
      setLikedComments(newUserLikes);
      localStorage.setItem("user_liked_comments", JSON.stringify(newUserLikes));

      // Update local state to reflect new like count immediately
      const relevant = updatedFeedbacks.filter(
        (f) => f.idiomHanzi === idiomHanzi
      );
      setComments(relevant.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error("Error liking comment", e);
    }
  };

  const handleReport = (commentId: string) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn báo cáo bình luận này là nội dung không phù hợp?"
      )
    ) {
      setReportNotification("Đã gửi báo cáo vi phạm. Cảm ơn đóng góp của bạn!");
      setTimeout(() => setReportNotification(""), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isPremium) return;

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      idiomHanzi: idiomHanzi,
      username: "VIP User", // Demo name
      content: newComment,
      timestamp: Date.now(),
      isPremium: true,
      likes: 0,
    };

    try {
      const stored = localStorage.getItem("public_feedbacks");
      const allFeedbacks: Feedback[] = stored ? JSON.parse(stored) : [];
      const updated = [...allFeedbacks, newFeedback];
      localStorage.setItem("public_feedbacks", JSON.stringify(updated));

      setNewComment("");
      // Reload
      const relevant = updated.filter((f) => f.idiomHanzi === idiomHanzi);
      setComments(relevant.sort((a, b) => b.timestamp - a.timestamp));

      // Scroll to top of list to see new comment (since we sort new to old)
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    } catch (e) {
      console.error("Error saving comment", e);
      alert("Bộ nhớ đầy, không thể lưu bình luận.");
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 md:p-8 relative">
      {/* Notification Toast */}
      {reportNotification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-4 py-2 rounded-lg shadow-lg z-10 animate-[fadeInUp_0.2s_ease-out]">
          {reportNotification}
        </div>
      )}

      <h3 className="font-hanzi text-xl font-bold text-slate-800 mb-6 flex items-center">
        <ChatBubbleIcon className="w-6 h-6 mr-2 text-red-600" />
        Góp ý & Thảo luận ({comments.length})
      </h3>

      {/* Comment List */}
      <div
        ref={scrollRef}
        className="space-y-4 mb-8 max-h-60 md:max-h-96 overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent overscroll-contain"
      >
        {comments.length === 0 ? (
          <div className="text-center py-6 text-slate-400 italic text-sm bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            Chưa có góp ý nào cho từ này. Hãy là người đầu tiên!
          </div>
        ) : (
          comments.map((comment) => {
            const isLiked = likedComments.includes(comment.id);
            return (
              <div
                key={comment.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all hover:border-red-100 mr-1"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        comment.isPremium
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                          : "bg-slate-400"
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-bold text-sm text-slate-700 mr-2">
                          {comment.username}
                        </span>
                        {comment.isPremium && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1 rounded border border-yellow-200">
                            VIP
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(comment.timestamp).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReport(comment.id)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                      title="Báo cáo vi phạm"
                    >
                      <FlagIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLike(comment.id)}
                      disabled={isLiked}
                      className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full transition-all duration-300 ${
                        isLiked
                          ? "text-red-500 bg-red-100 cursor-default"
                          : "text-slate-400 bg-white border border-slate-200 hover:border-red-300 hover:text-red-500 active:scale-95"
                      }`}
                    >
                      <HeartIcon
                        className={`w-3.5 h-3.5 ${
                          isLiked ? "fill-current" : ""
                        }`}
                        filled={isLiked}
                      />
                      <span className="font-medium">{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
                <p className="text-slate-700 text-sm ml-10 leading-relaxed whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      {isLoggedIn ? (
        isPremium ? (
          <form onSubmit={handleSubmit} className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 relative">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ hiểu biết của bạn về từ này..."
                className="min-h-[80px] pb-12 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute bottom-3 right-3 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm z-10"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center">
            <p className="text-slate-600 mb-2">
              Chỉ thành viên{" "}
              <span className="font-bold text-amber-600">VIP</span> mới có thể
              đóng góp ý kiến.
            </p>
            <p className="text-xs text-slate-400">
              Nâng cấp ngay để cùng xây dựng từ điển phong phú hơn!
            </p>
          </div>
        )
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-slate-500 text-sm">
            Vui lòng <span className="font-bold text-red-600">Đăng nhập</span>{" "}
            để tham gia thảo luận.
          </p>
        </div>
      )}
    </div>
  );
};

export default IdiomComments;
