import React from "react";
import {
  HistoryIcon,
  BookmarkIconFilled,
  BrainIcon,
  CardIcon,
} from "@/components/common/icons";

interface FlashcardHeaderProps {
  source: "all" | "saved";
  setSource: (source: "all" | "saved") => void;
  isLoggedIn: boolean;
  reviewQueueLength: number;
  onSavedClickError: () => void;
}

const FlashcardHeader: React.FC<FlashcardHeaderProps> = ({
  source,
  setSource,
  isLoggedIn,
  reviewQueueLength,
  onSavedClickError,
}) => {
  return (
    <div className="flex flex-col gap-6 mb-8 pt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-100 flex items-center justify-center">
            <CardIcon className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-hanzi text-slate-800 tracking-tight">
              Thẻ ghi nhớ
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-none">
              Học tập thông minh hơn
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto overflow-hidden">
            <button
              onClick={() => setSource("all")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                source === "all"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" /> Tất cả
            </button>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  onSavedClickError();
                  return;
                }
                setSource("saved");
              }}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                source === "saved"
                  ? "bg-red-600 text-white shadow-lg shadow-red-200"
                  : "text-slate-500 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <BookmarkIconFilled className="w-3.5 h-3.5" /> Đã lưu
            </button>
          </div>

          <div className="flex items-center gap-2 text-indigo-600 text-xs font-black bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm self-stretch sm:self-auto justify-center">
            <BrainIcon className="w-3.5 h-3.5" />
            <span className="uppercase tracking-widest text-[10px]">
              Đang ôn: {reviewQueueLength}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardHeader;
