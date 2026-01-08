import React, { useRef, useState } from "react";
import { DownloadIcon, UploadIcon, XIcon, FileIcon } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplate: () => void;
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onDownloadTemplate,
  onFileSelect,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-[95%] sm:max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <UploadIcon className="w-5 h-5 text-emerald-600" />
            Nhập Excel
          </h3>
          <button
            onClick={onDownloadTemplate}
            className="text-[10px] sm:text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 sm:py-1.5 rounded-lg transition-colors flex items-center gap-1.5 mr-8 sm:mr-10 active:scale-95"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            <span className="inline">Tải mẫu</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all duration-200 group
              ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/50 scale-[1.02]"
                  : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
              }
              ${isProcessing ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
            />

            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <UploadIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <p className="text-slate-800 font-bold text-base sm:text-lg mb-1">
              Kéo thả file vào đây
            </p>
            <p className="text-slate-500 text-xs sm:text-sm mb-4">
              Hoặc nhấn để chọn file Excel (.xlsx)
            </p>

            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 group-hover:border-emerald-200 group-hover:text-emerald-700 transition-colors shadow-sm">
              <FileIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Chọn từ máy tính
            </div>
          </div>

          <p className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs text-slate-400 leading-relaxed px-2">
            Hỗ trợ nhập hàng loạt: Trắc nghiệm, Điền từ, Nối cặp.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-all"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ImportModal;
