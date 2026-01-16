import React from "react";
import {
  TrashIcon,
  BookOpenIcon,
  ChevronRightIcon,
} from "@/components/common/icons";
import type { Idiom } from "@/types";

interface SavedItemProps {
  item: Idiom;
  isSelected: boolean;
  onItemClick: (hanzi: string) => void;
  onRemove: (e: React.MouseEvent, id: string, hanzi: string) => void;
  onToggleSelect: (id: string) => void;
}

const SavedItem: React.FC<SavedItemProps> = ({
  item,
  isSelected,
  onItemClick,
  onRemove,
  onToggleSelect,
}) => {
  return (
    <div
      onClick={() => onItemClick(item.hanzi)}
      className={`group relative bg-white p-6 rounded-4xl border-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full ${
        isSelected
          ? "border-indigo-600 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50"
          : "border-slate-50 hover:border-red-100 shadow-sm hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1"
      }`}
    >
      {/* Decorative Accent */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full transition-all duration-700 blur-2xl ${
          isSelected
            ? "bg-indigo-500/10"
            : "bg-red-500/0 group-hover:bg-red-500/5"
        }`}
      />

      {/* Checkbox and Delete Row */}
      <div className="flex justify-between items-center mb-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-300 relative ${
            isSelected
              ? "bg-indigo-600 border-indigo-600"
              : "bg-slate-50 border-slate-200 group-hover:border-red-200"
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(item.id!);
            }}
            className="w-full h-full opacity-0 absolute cursor-pointer z-10"
          />
          {isSelected && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={4}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            item.id && onRemove(e, item.id, item.hanzi);
          }}
          className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform active:scale-90"
          title="Bỏ lưu"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h2 className="text-4xl font-hanzi font-black text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">
            {item.hanzi}
          </h2>
          {/* <span className="text-[10px] py-0.5 px-2 bg-slate-100 text-slate-400 rounded-full font-black uppercase tracking-widest border border-slate-200 group-hover:bg-red-50 group-hover:text-red-500 group-hover:border-red-100 transition-all">
            {item.level || "HSK"}
          </span> */}
        </div>

        <div>
          <p className="text-red-600 font-extrabold text-[11px] md:text-xs uppercase tracking-[0.2em] mb-2 md:mb-3">
            {item.pinyin}
          </p>
          <p className="text-slate-600 text-sm font-bold line-clamp-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {item.vietnameseMeaning}
          </p>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 group-hover:text-red-500 transition-colors">
          <BookOpenIcon className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Sổ tay
          </span>
        </div>
        <div className="flex items-center gap-1 text-indigo-600 scale-90 group-hover:scale-100 transition-transform">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Khám phá
          </span>
          <ChevronRightIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default SavedItem;
