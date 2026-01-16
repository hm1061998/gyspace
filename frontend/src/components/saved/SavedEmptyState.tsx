import React from "react";
import { BookOpenIcon, SearchIcon } from "@/components/common/icons";

interface SavedEmptyStateProps {
  isFilterActive: boolean;
  filterText: string;
  onExplore: () => void;
}

const SavedEmptyState: React.FC<SavedEmptyStateProps> = ({
  isFilterActive,
  filterText,
  onExplore,
}) => {
  if (isFilterActive) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center">
        <SearchIcon className="w-10 h-10 mb-2 opacity-10" />
        <p className="text-sm italic">
          Không tìm thấy kết quả nào khớp với "{filterText}"
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <BookOpenIcon className="w-16 h-16 mb-4 opacity-10" />
      <p className="text-lg font-bold text-slate-300">
        Sổ tay cá nhân của bạn đang trống.
      </p>
      <button
        onClick={onExplore}
        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all text-sm uppercase tracking-wider"
      >
        Khám phá ngay
      </button>
    </div>
  );
};

export default SavedEmptyState;
