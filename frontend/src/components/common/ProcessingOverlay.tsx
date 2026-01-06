import React from "react";
import { DocumentIcon, SpinnerIcon, DownloadIcon } from "./icons";

interface ProcessingOverlayProps {
  isOpen: boolean;
  status: string;
  progress: number;
  title?: string;
  type?: "import" | "export";
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isOpen,
  status,
  progress,
  title = "Đang xử lý dữ liệu",
  type = "import",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
      <div className="bg-white rounded-4xl p-8 sm:p-12 shadow-2xl max-w-md w-full flex flex-col items-center text-center space-y-6 transform animate-in zoom-in-95 duration-300">
        <div className="relative">
          <div
            className={`w-20 h-20 ${
              type === "import" ? "bg-emerald-50" : "bg-blue-50"
            } rounded-3xl flex items-center justify-center animate-pulse`}
          >
            {type === "import" ? (
              <DocumentIcon className="w-10 h-10 text-emerald-600" />
            ) : (
              <DownloadIcon className="w-10 h-10 text-blue-600" />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg border border-slate-50">
            <SpinnerIcon
              className={`w-6 h-6 ${
                type === "import" ? "text-emerald-600" : "text-blue-600"
              }`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {title}
          </h3>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest min-h-[1rem]">
            {status}
          </p>
        </div>

        <div className="w-full space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
            <div
              className={`h-full bg-linear-to-r ${
                type === "import"
                  ? "from-emerald-500 to-teal-500 shadow-emerald-100"
                  : "from-blue-500 to-indigo-500 shadow-blue-100"
              } transition-all duration-300 ease-out shadow-lg`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Tiến trình</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          Vui lòng không đóng cửa sổ này cho đến khi quá trình hoàn tất.
        </p>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
