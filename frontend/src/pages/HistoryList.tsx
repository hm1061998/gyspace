import React, { useMemo } from "react";
import { SpinnerIcon, CalendarIcon } from "@/components/common/icons";
import type { Idiom } from "@/types";
import Pagination from "@/components/common/Pagination";
import BulkActionBar from "@/components/common/BulkActionBar";
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";
import { useHistory } from "@/hooks/useHistory";
import HistoryHeader from "@/components/history/HistoryHeader";
import HistoryItem from "@/components/history/HistoryItem";
import HistoryEmptyState from "@/components/history/HistoryEmptyState";
import Container from "@/components/common/Container";
import { useSetBackAction } from "@/context/NavigationContext";

interface HistoryListProps {
  onBack: () => void;
  onSelect: (idiom: Idiom) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ onSelect, onBack }) => {
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
    handleClearAll,
    handleBulkDelete,
    toggleSelectAll,
    toggleSelect,
    isAllSelected,
    isSomeSelected,
  } = useHistory();

  useSetBackAction(onBack, "Lịch sử");

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const yesterday = today - 86400000;

    filteredItems.forEach((item: any) => {
      const d = new Date(item.searchedAt || Date.now());
      const itemDay = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate()
      ).getTime();

      let groupKey = "";
      if (itemDay === today) groupKey = "Hôm nay";
      else if (itemDay === yesterday) groupKey = "Hôm qua";
      else {
        groupKey = d.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "numeric",
          month: "numeric",
        });
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/50">
      <HistoryHeader
        filter={filter}
        setFilter={setFilter}
        onClearAll={handleClearAll}
        showClearAll={historyItems.length > 0}
        onBack={onBack}
      />

      {/* Middle Section: Scrollable List */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar pb-12 pt-4">
        <Container>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 rounded-full animate-pulse"></div>
                <SpinnerIcon className="w-10 h-10 text-red-600 animate-spin absolute inset-0 m-auto" />
              </div>
              <p className="font-bold text-xs uppercase tracking-[0.2em] mt-6 opacity-60">
                Đang lục lại lịch sử...
              </p>
            </div>
          ) : historyItems.length === 0 ? (
            <HistoryEmptyState isFilterActive={false} filterText="" />
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
                  subLabel={`(Tổng ${filteredItems.length} mục)`}
                  className="sm:mb-0"
                />
              </div>

              {(
                Object.entries(groupedItems) as [string, typeof filteredItems][]
              ).map(([date, items]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="p-1.5 bg-white rounded-lg shadow-xs border border-slate-100 text-slate-400">
                      <CalendarIcon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                      {date}
                    </h3>
                    <div className="flex-1 h-px bg-slate-100 ml-2" />
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                    {items.map((item, index) => (
                      <HistoryItem
                        key={`${item.id}-${index}`}
                        item={item}
                        index={filteredItems.indexOf(item) + 1}
                        isSelected={selectedIds.includes(item.id!)}
                        onSelect={onSelect}
                        onToggleSelect={toggleSelect}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && filter && (
                <HistoryEmptyState isFilterActive={true} filterText={filter} />
              )}
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

export default HistoryList;
