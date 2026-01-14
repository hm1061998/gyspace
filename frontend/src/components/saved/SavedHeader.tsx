import React from "react";
import {
  SearchIcon,
  DownloadIcon,
  DocumentIcon,
  SpinnerIcon,
  BookOpenIcon,
} from "@/components/common/icons";

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
    <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-10 px-4 py-4 md:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-hanzi font-bold text-slate-800 flex items-center gap-2">
            <BookOpenIcon className="w-6 h-6 text-red-600" />
            Sổ tay cá nhân
            <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-full border border-red-100 uppercase tracking-widest font-black">
              {totalItems} mục
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 bg-slate-50 transition-all text-sm"
            />
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportExcel}
              disabled={isExportingExcel || totalItems === 0}
              className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full hover:bg-emerald-100 transition-all disabled:opacity-50"
              title="Xuất Excel bộ sưu tập này"
            >
              {isExportingExcel ? (
                <SpinnerIcon className="w-4 h-4" />
              ) : (
                <DownloadIcon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onExportPDF}
              disabled={isExportingPDF || totalItems === 0}
              className="p-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-full hover:bg-orange-100 transition-all disabled:opacity-50"
              title="Xuất PDF bộ sưu tập này"
            >
              {isExportingPDF ? (
                <SpinnerIcon className="w-4 h-4" />
              ) : (
                <DocumentIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedHeader;
