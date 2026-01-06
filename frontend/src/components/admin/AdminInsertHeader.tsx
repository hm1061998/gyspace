import React from "react";
import { ArrowLeftIcon, PlusIcon, PencilIcon } from "@/components/common/icons";

interface AdminInsertHeaderProps {
  onBack: () => void;
  isEditing: boolean;
}

const AdminInsertHeader: React.FC<AdminInsertHeaderProps> = ({
  onBack,
  isEditing,
}) => {
  return (
    <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 -ml-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                title="Quay lại"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-800 flex items-center">
                {isEditing ? (
                  <PencilIcon className="w-5 h-5 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-600 shrink-0" />
                ) : (
                  <PlusIcon className="w-5 h-5 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-600 shrink-0" />
                )}
                <span className="truncate">
                  {isEditing ? "Chỉnh sửa từ vựng" : "Thêm từ mới"}
                </span>
              </h1>
              <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">
                {isEditing
                  ? "Cập nhật thông tin chi tiết cho từ vựng hiện có"
                  : "Tạo nội dung mới cho kho tàng quán dụng ngữ"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInsertHeader;
