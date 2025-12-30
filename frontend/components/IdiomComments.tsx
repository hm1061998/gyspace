import React, { useState, useEffect, useRef } from "react";
import {
  ChatBubbleIcon,
  HeartIcon,
  PaperAirplaneIcon,
  UserIcon,
  FlagIcon,
} from "./icons";
import type { Feedback } from "../types";

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
  }, [idiomHanzi]);

  const loadComments = () => {
    try {
      const stored = localStorage.getItem("public_feedbacks");
      if (stored) {
        const allFeedbacks: Feedback[] = JSON.parse(stored);
        const relevant = allFeedbacks.filter(
          (f) => f.idiomHanzi === idiomHanzi
        );
        setComments(relevant.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLike = (commentId: string) => {
    if (likedComments.includes(commentId)) return;
    setLikedComments((prev) => [...prev, commentId]);
  };

  const handleReport = (commentId: string) => {
    setReportNotification("Đã gửi báo cáo vi phạm.");
    setTimeout(() => setReportNotification(""), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      idiomHanzi: idiomHanzi,
      username: "VIP User",
      content: newComment,
      timestamp: Date.now(),
      isPremium: true,
      likes: 0,
    };
    const updated = [newFeedback, ...comments];
    setComments(updated);
    setNewComment("");
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 md:p-8 relative mt-6">
      {reportNotification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-4 py-2 rounded-lg shadow-lg z-10">
          {reportNotification}
        </div>
      )}
      <h3 className="font-hanzi text-xl font-bold text-slate-800 mb-6 flex items-center">
        <ChatBubbleIcon className="w-6 h-6 mr-2 text-red-600" />
        Thảo luận ({comments.length})
      </h3>
      <div
        ref={scrollRef}
        className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2"
      >
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-slate-50 p-4 rounded-xl border border-slate-100"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-700">
                  {comment.username}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReport(comment.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <FlagIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-red-500"
                >
                  <HeartIcon className="w-3.5 h-3.5" />
                  <span className="text-xs">
                    {comment.likes +
                      (likedComments.includes(comment.id) ? 1 : 0)}
                  </span>
                </button>
              </div>
            </div>
            <p className="text-slate-700 text-sm ml-10">{comment.content}</p>
          </div>
        ))}
      </div>
      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Chia sẻ hiểu biết..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none resize-none h-20"
          />
          <button
            type="submit"
            className="p-2 bg-red-600 text-white rounded-lg h-10 mt-auto"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default IdiomComments;
