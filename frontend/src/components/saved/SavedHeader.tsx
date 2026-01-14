import React from "react";
import {
  SearchIcon,
  DownloadIcon,
  DocumentIcon,
  SpinnerIcon,
  BookOpenIcon,
} from "@/components/common/icons";
import Container from "@/components/common/Container";

interface SavedHeaderProps {
  totalItems: number;
  filter: string;
  setFilter: (val: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  isExportingExcel?: boolean;
  isExportingPDF?: boolean;
}

const SavedHeader: React.FC<SavedHeaderProps> = ({
  totalItems,
  filter,
  setFilter,
  onExportExcel,
  onExportPDF,
  isExportingExcel = false,
  isExportingPDF = false,
}) => {
  return (
    <div className="flex-none bg-white border-b border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-20 py-5">
      <Container className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
            <BookOpenIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-hanzi font-black text-slate-800 flex items-center gap-3">
              Sổ tay cá nhân
              <div className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] rounded-lg border border-red-100 uppercase tracking-widest font-black shadow-xs">
                {totalItems} mục
              </div>
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Kho lưu trữ từ vựng riêng của bạn
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group">
            <input
              type="text"
              placeholder="Lục lại sổ tay..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-72 pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-400 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
            />
            <SearchIcon className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-red-500 transition-colors" />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button
              onClick={onExportExcel}
              disabled={isExportingExcel || totalItems === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all disabled:opacity-50 shadow-xs font-black text-[10px] uppercase tracking-widest"
              title="Xuất Excel bộ sưu tập này"
            >
              {isExportingExcel ? (
                <SpinnerIcon className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadIcon className="w-4 h-4" />
              )}
              <span>Excel</span>
            </button>
            <button
              onClick={onExportPDF}
              disabled={isExportingPDF || totalItems === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 border border-slate-100 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all disabled:opacity-50 shadow-xs font-black text-[10px] uppercase tracking-widest"
              title="Xuất PDF bộ sưu tập này"
            >
              {isExportingPDF ? (
                <SpinnerIcon className="w-4 h-4 animate-spin" />
              ) : (
                <DocumentIcon className="w-4 h-4" />
              )}
              <span>PDF</span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SavedHeader;
