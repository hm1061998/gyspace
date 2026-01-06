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
    <div className={`bulk-bar ${className}`}>
      <div className="bulk-bar-left">
        <CheckCircleIcon className="bulk-bar-icon text-indigo-600" />
        <span className="bulk-bar-text">
          Đã chọn {selectedCount} {label}
        </span>
      </div>
      <div className="bulk-bar-right">
        <button onClick={onClearSelection} className="bulk-btn-clear">
          Bỏ chọn
        </button>
        <button onClick={onDelete} className="bulk-btn-delete">
          <TrashIcon className="bulk-bar-icon" />
          {deleteLabel}
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
