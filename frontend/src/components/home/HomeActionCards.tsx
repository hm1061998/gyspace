import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainIcon,
  CardIcon,
  PuzzlePieceIcon,
} from "@/components/common/icons";
import { toast } from "@/libs/Toast";

const HomeActionCards: React.FC = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl px-4 animate-pop delay-100 mt-3">
      <button
        onClick={() => navigate("flashcards")}
        className="group relative bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-[2.5rem] text-left overflow-hidden shadow-2xl hover:shadow-red-200 hover:-translate-y-1.5 transition-all duration-300"
      >
        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <BrainIcon className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
            <CardIcon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Ôn tập Flashcard
          </h3>
          {/* <p className="text-red-100 text-sm opacity-90 leading-relaxed">
            Ôn tập hiệu quả bằng thuật toán ghi nhớ thông minh nhất.
          </p> */}
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            Đang mở ôn tập
          </div>
        </div>
      </button>

      <button
        onClick={() => navigate("word_search")}
        className="group relative bg-gradient-to-br from-indigo-600 to-sky-700 p-8 rounded-[2.5rem] text-left overflow-hidden shadow-2xl hover:shadow-indigo-200 hover:-translate-y-1.5 transition-all duration-300"
      >
        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <PuzzlePieceIcon className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
            <PuzzlePieceIcon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Game Tìm Chữ</h3>
          {/* <p className="text-sky-100 text-sm opacity-90 leading-relaxed">
            Thử thách nhãn quan và ghi nhớ từ vựng qua trò chơi.
          </p> */}
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
            Thử thách tuần
          </div>
        </div>
      </button>

      <button
        onClick={() => {
          // if (!isLoggedIn) {
          //   toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
          //   return;
          // }
          navigate("exams");
        }}
        className="group relative bg-gradient-to-br from-purple-600 to-fuchsia-700 p-8 rounded-[2.5rem] text-left overflow-hidden shadow-2xl hover:shadow-purple-200 hover:-translate-y-1.5 transition-all duration-300"
      >
        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <BrainIcon className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
            <BrainIcon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Luyện tập</h3>
          {/* <p className="text-purple-100 text-sm opacity-90 leading-relaxed">
            Rèn luyện kỹ năng qua các bài tập thực hành.
          </p> */}
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
            Tổng hợp
          </div>
        </div>
      </button>
    </div>
  );
};

export default HomeActionCards;
