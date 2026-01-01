import React, { useState, useEffect } from "react";
import { confirmService, ConfirmState } from "@/services/ui/confirmService";
import { SpinnerIcon, ExclamationIcon, QuestionMarkIcon } from "./icons";

const ConfirmModal: React.FC = () => {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    options: { message: "" },
    isProcessing: false,
  });

  useEffect(() => {
    // Đăng ký nhận thông báo từ service
    const unsubscribe = confirmService.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  if (!state.isOpen) return null;

  const {
    title = "Xác nhận",
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = "info",
  } = state.options;

  // Color schemes based on type
  const colorSchemes = {
    danger: {
      bg: "bg-red-50",
      text: "text-red-600",
      button: "bg-red-600 hover:bg-red-700 shadow-red-200",
      topBar: "bg-red-600",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
      topBar: "bg-amber-600",
    },
    info: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
      topBar: "bg-blue-600",
    },
  };

  const colors = colorSchemes[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={() => !state.isProcessing && confirmService.handleCancel()}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-pop overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${colors.topBar}`} />

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center mb-6`}
          >
            {type === "danger" ? (
              <ExclamationIcon className="w-8 h-8" />
            ) : (
              <QuestionMarkIcon className="w-8 h-8" />
            )}
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
          <p className="text-slate-500 text-sm mb-8 whitespace-pre-line">
            {message}
          </p>

          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={() => confirmService.handleCancel()}
              disabled={state.isProcessing}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={() => confirmService.handleConfirm()}
              disabled={state.isProcessing}
              className={`flex-1 py-3 ${colors.button} text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {state.isProcessing ? (
                <SpinnerIcon className="w-5 h-5" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
