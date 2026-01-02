import React from "react";
import { CheckCircleIcon, TrashIcon } from "./icons";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
  label?: string;
  deleteLabel?: string;
  className?: string;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onDelete,
  onClearSelection,
  label = "mục",
  deleteLabel = "Xóa đã chọn",
  className = "",
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`bg-indigo-50 border border-indigo-200 rounded-xl p-2 mb-4 flex items-center justify-between animate-pop shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
        <span className="text-sm font-semibold text-indigo-900">
          Đã chọn {selectedCount} {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClearSelection}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
        >
          Bỏ chọn
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
        >
          <TrashIcon className="w-4 h-4" />
          {deleteLabel}
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
