import React from "react";
import { SpinnerIcon } from "@/components/common/icons";
import Pagination from "@/components/common/Pagination";
import BulkActionBar from "@/components/common/BulkActionBar";
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";
import MyReportHeader from "@/components/userReportList/MyReportHeader";
import MyReportItem from "@/components/userReportList/MyReportItem";
import { useMyReports } from "@/hooks/useMyReports";
import EmptyState from "@/components/userReportList/EmptyState";
import Container from "@/components/common/Container";
import { useSetBackAction } from "@/context/NavigationContext";

const UserReportList: React.FC<any> = ({ onSelect, onBack }) => {
  const {
    historyItems,
    loading,
    filter,
    setFilter,
    selectedIds,
    setSelectedIds,
    page,
    setPage,
    totalPages,
    filteredItems,
    handleBulkDelete,
    toggleSelectAll,
    toggleSelect,
    isAllSelected,
    isSomeSelected,
  } = useMyReports();

  useSetBackAction(onBack, "Báo lỗi");

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/50">
      <MyReportHeader filter={filter} setFilter={setFilter} />

      {/* Middle Section: Scrollable List */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar pb-12 pt-4">
        <Container>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <SpinnerIcon className="w-10 h-10 text-red-600 animate-spin mb-4" />
              <p className="font-bold text-xs uppercase tracking-widest">
                Đang tải danh sách...
              </p>
            </div>
          ) : historyItems.length === 0 ? (
            <EmptyState isFilterActive={false} filterText="" />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <BulkActionBar
                  selectedCount={selectedIds.length}
                  onDelete={handleBulkDelete}
                  onClearSelection={() => setSelectedIds([])}
                  label="mục"
                />

                <SelectAllCheckbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={toggleSelectAll}
                  subLabel={`(${filteredItems.length} mục)`}
                  className="sm:mb-0"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                {filteredItems.map((item, index) => (
                  <MyReportItem
                    key={`${item.id}-${index}`}
                    item={item}
                    index={(page - 1) * 20 + index + 1}
                    isSelected={selectedIds.includes(item.id!)}
                    onSelect={onSelect}
                    onToggleSelect={toggleSelect}
                  />
                ))}
                {filteredItems.length === 0 && filter && (
                  <EmptyState isFilterActive={true} filterText={filter} />
                )}
              </div>
            </div>
          )}
        </Container>
      </div>

      {/* Fixed Bottom Section */}
      {totalPages > 1 && (
        <div className="flex-none bg-white border-t border-slate-200 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <Container>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </Container>
        </div>
      )}
    </div>
  );
};

export default UserReportList;
