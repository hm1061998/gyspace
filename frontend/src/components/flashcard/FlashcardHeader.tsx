import React from "react";
import {
  HistoryIcon,
  BookmarkIconFilled,
  BrainIcon,
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
    <div className="flex justify-between items-center ">
      <div className="flex bg-white p-1 rounded-full border shadow-sm">
        <button
          onClick={() => setSource("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            source === "all"
              ? "bg-slate-800 text-white shadow-md"
              : "text-slate-500"
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
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            source === "saved"
              ? "bg-red-600 text-white shadow-md"
              : "text-slate-500"
          }`}
        >
          <BookmarkIconFilled className="w-3.5 h-3.5" /> Đã lưu
        </button>
      </div>
      <div className="w-10 flex justify-end">
        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold bg-white px-2 py-1 rounded-lg border">
          <BrainIcon className="w-3 h-3" />
          <span>{reviewQueueLength}</span>
        </div>
      </div>
    </div>
  );
};

export default FlashcardHeader;
