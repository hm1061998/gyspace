import React from "react";
import { SpinnerIcon, ExclamationIcon } from "./icons";

const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  idiomHanzi: string;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, idiomHanzi, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-pop overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
            <ExclamationIcon className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Xác nhận xóa?
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Bạn có chắc chắn muốn xóa từ{" "}
            <span className="font-hanzi font-bold text-slate-800 text-base">
              "{idiomHanzi}"
            </span>{" "}
            không? Hành động này không thể hoàn tác.
          </p>

          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isDeleting ? <SpinnerIcon className="w-5 h-5" /> : "Xóa ngay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
