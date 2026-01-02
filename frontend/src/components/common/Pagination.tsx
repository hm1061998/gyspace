import React from "react";
import { ArrowLeftIcon, ChevronRightIcon } from "./icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showInfo = true,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-center gap-4 py-4 w-full ${className}`}
    >
      {showInfo && (
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest sm:mr-auto">
          Trang {currentPage} <span className="mx-1 opacity-50">/</span>{" "}
          {totalPages}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          aria-label="Trang trước"
        >
          <ArrowLeftIcon className="w-4 h-4 group-active:-translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, i) => (
            <React.Fragment key={i}>
              {p === "..." ? (
                <span className="w-8 h-8 flex items-center justify-center text-slate-300 font-medium pt-2">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(p as number)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                    currentPage === p
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-transparent"
                  }`}
                >
                  {p}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          aria-label="Trang sau"
        >
          <ChevronRightIcon className="w-4 h-4 group-active:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
