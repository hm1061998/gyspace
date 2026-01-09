import React, { ReactNode } from "react";
import BulkActionBar from "./BulkActionBar";
import Pagination from "./Pagination";

export interface Column<T> {
  header: ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => ReactNode;
  className?: string; // Applied to both th and td
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor: (item: T) => string | number;
  emptyImage?: ReactNode; // Optional icon/image for empty state
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  enableSelection?: boolean;
  selectedIds?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  onBulkDelete?: () => void;
  bulkActionLabel?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const Table = <T,>({
  columns,
  data,
  loading = false,
  keyExtractor,
  emptyImage,
  emptyMessage = "Không tìm thấy dữ liệu",
  onRowClick,
  className = "",
  enableSelection = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  onBulkDelete,
  bulkActionLabel = "",
  currentPage,
  totalPages,
  onPageChange,
}: TableProps<T>) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      const isIndeterminate =
        selectedIds.length > 0 && selectedIds.length < data.length;
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedIds, data.length]);

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ${className}`}
    >
      {/* Bulk Action Bar Overlay */}
      {enableSelection && selectedIds.length > 0 && (
        <div className="z-30">
          <BulkActionBar
            selectedCount={selectedIds.length}
            onDelete={onBulkDelete || (() => {})}
            onClearSelection={onSelectAll || (() => {})}
            label={bulkActionLabel}
            className="mb-0! rounded-none! border-x-0! border-t-0! border-b border-indigo-100 bg-indigo-50/95 backdrop-blur-sm shadow-none"
          />
        </div>
      )}

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              {enableSelection && (
                <th className="sticky top-0 z-20 px-6 py-4 w-14 text-center bg-slate-50/95 backdrop-blur-sm">
                  <input
                    ref={checkboxRef}
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`sticky top-0 z-20 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/95 backdrop-blur-sm ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td
                    colSpan={columns.length + (enableSelection ? 1 : 0)}
                    className="px-6 py-8"
                  >
                    <div className="h-10 bg-slate-100 rounded-xl" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (enableSelection ? 1 : 0)}
                  className="px-6 py-20 text-center"
                >
                  <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                    {emptyImage && (
                      <div className="w-16 h-16 flex items-center justify-center">
                        {emptyImage}
                      </div>
                    )}
                    <p className="font-bold text-slate-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const id = String(keyExtractor(item));
                const isSelected = selectedIds.includes(id);

                return (
                  <tr
                    key={id}
                    className={`transition-colors group ${
                      isSelected
                        ? "bg-indigo-50/30 hover:bg-indigo-50/50"
                        : "hover:bg-slate-50/50"
                    } ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {enableSelection && (
                      <td className="px-6 py-4 w-14 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td
                        key={idx}
                        className={`px-6 py-4 ${col.className || ""}`}
                      >
                        {col.cell
                          ? col.cell(item, index)
                          : col.accessorKey
                          ? (item[col.accessorKey] as ReactNode)
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading &&
        totalPages !== undefined &&
        totalPages > 1 &&
        currentPage !== undefined &&
        onPageChange && (
          <div className="border-t border-slate-100 p-4 bg-slate-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
    </div>
  );
};

export default Table;
