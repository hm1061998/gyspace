import React from "react";
import { HeartIcon, ChatBubbleIcon } from "@/components/common/icons";
import type { Feedback } from "@/types";

interface FeaturedCommentsProps {
  onSearch: (term: string) => void;
}

const FeaturedComments: React.FC<FeaturedCommentsProps> = ({ onSearch }) => {
  // Mock data for featured comments
  const featured: Feedback[] = [
    {
      id: "f1",
      username: "Lão Hạc",
      content: "Từ này dùng khi chém gió rất hợp lý!",
      timestamp: Date.now(),
      isPremium: true,
      likes: 12,
      idiomHanzi: "666",
    },
    {
      id: "f2",
      username: "Nguyệt",
      content: "Nghĩa gốc thú vị quá, giờ mới biết.",
      timestamp: Date.now(),
      isPremium: true,
      likes: 8,
      idiomHanzi: "画蛇添足",
    },
  ];

  return (
    <div className="w-full mt-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-center space-x-2 mb-6 text-slate-400">
        <ChatBubbleIcon className="w-4 h-4" />
        <h3 className="font-bold text-xs uppercase tracking-widest">
          Góp ý nổi bật
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featured.map((item) => (
          <div
            key={item.id}
            className="bg-white/60 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-200 hover:border-red-200 cursor-pointer"
            onClick={() => onSearch(item.idiomHanzi)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-700">
                {item.username}
              </span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded font-hanzi">
                {item.idiomHanzi}
              </span>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2 italic">
              "{item.content}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedComments;
