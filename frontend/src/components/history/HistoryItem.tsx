import React from "react";
import { ChevronRightIcon, ClockIcon } from "@/components/common/icons";
import type { Idiom } from "@/types";

interface HistoryItemProps {
  item: Idiom & { searchedAt?: string | Date };
  index: number;
  isSelected: boolean;
  onSelect: (idiom: Idiom) => void;
  onToggleSelect: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  onToggleSelect,
}) => {
  const timeStr = item.searchedAt
    ? new Date(item.searchedAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      onClick={() => onSelect(item)}
      className={`p-4 md:p-5 border-b border-slate-100 last:border-0 cursor-pointer transition-all flex items-center justify-between group relative overflow-hidden ${
        isSelected ? "bg-indigo-50/50" : "hover:bg-slate-50/50"
      }`}
    >
      {/* Decorative side bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
          isSelected ? "bg-indigo-500" : "bg-transparent group-hover:bg-red-200"
        }`}
      />

      <div className="flex items-center gap-4 relative z-10">
        {/* Individual Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(item.id!);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 text-indigo-600 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 cursor-pointer transition-all"
          />
        </div>

        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] md:text-xs group-hover:bg-white group-hover:text-red-600 transition-all">
          {index}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base md:text-xl font-hanzi font-black text-slate-800 group-hover:text-red-700 transition-colors">
              {item.hanzi}
            </span>
            <div className="h-3 w-px bg-slate-200" />
            <span className="text-[9px] md:text-[10px] text-red-600 font-extrabold uppercase tracking-widest bg-red-50 px-1.5 py-0.5 rounded-md">
              {item.pinyin}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3">
            <p className="text-[11px] md:text-xs text-slate-500 line-clamp-1 font-bold italic opacity-80">
              {item.vietnameseMeaning}
            </p>
            {timeStr && (
              <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-slate-300">
                <ClockIcon className="w-3 h-3" />
                <span>{timeStr}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 hidden sm:flex items-center gap-2">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            Chi tiết
          </span>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

export default HistoryItem;
