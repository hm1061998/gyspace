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
    <div className={`pagination-container ${className}`}>
      {showInfo && (
        <div className="pagination-info">
          Trang {currentPage} <span className="mx-1 opacity-50">/</span>{" "}
          {totalPages}
        </div>
      )}

      <div className="pagination-btn-wrapper">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="pagination-btn-arrow"
          aria-label="Trang trước"
        >
          <ArrowLeftIcon className="dashboard-action-icon" />
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
                  className={`pagination-btn-number ${
                    currentPage === p ? "is-current" : ""
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
          className="pagination-btn-arrow"
          aria-label="Trang sau"
        >
          <ChevronRightIcon className="dashboard-action-icon text-red-600" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
