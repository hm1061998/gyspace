import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeftIcon,
  FireIcon,
  SearchIcon,
  SpinnerIcon,
  TrashIcon,
  CloseIcon,
} from "@/components/common/icons";
import DateRangePicker from "@/components/common/DateRangePicker";
import Table from "@/components/common/Table";
import {
  fetchSearchLogs,
  deleteSearchLog,
  bulkDeleteSearchLogs,
  SearchLog,
} from "@/services/api/idiomService";
import { toast } from "@/libs/Toast";
import { modalService } from "@/libs/Modal";
import { debounce } from "lodash";

const SearchLogs: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedQueries, setSelectedQueries] = useState<string[]>([]);

  useEffect(() => {
    fetchLogs(search, page, startDate, endDate);
  }, [page, startDate, endDate]);

  const reloadData = () => {
    setSearch("");
    setPage(1);
    fetchLogs("", 1, startDate, endDate);
  };

  const debouncedFetch = useMemo(() => {
    return debounce((value) => {
      setPage(1);
      fetchLogs(value, 1, startDate, endDate);
    }, 500); // 500ms delay
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(event.target.value);
    debouncedFetch(event.target.value);
  };

  const fetchLogs = async (
    searchParam: string,
    pageParam: number,
    startDateParam: string,
    endDateParam: string
  ) => {
    try {
      setLoading(true);
      const response = await fetchSearchLogs({
        page: pageParam,
        limit: 20,
        search: searchParam,
        filter: {
          startDate: startDateParam || undefined,
          endDate: endDateParam || undefined,
        },
      });
      setLogs(response.data);
      setTotalPages(response.meta.lastPage);
      setSelectedQueries([]); // Clear selection when data changes
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (query: string) => {
    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa tất cả log tìm kiếm cho từ khóa "${query}" không?`
    );

    if (!confirmed) return;

    try {
      await deleteSearchLog(query);
      toast.success("Đã xóa thành công");
      fetchLogs(search, page, startDate, endDate);
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQueries.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một mục để xóa");
      return;
    }

    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa ${selectedQueries.length} log tìm kiếm đã chọn không?`
    );

    if (!confirmed) return;

    try {
      await bulkDeleteSearchLogs(selectedQueries);
      toast.success(`Đã xóa ${selectedQueries.length} log thành công`);
      fetchLogs(search, page, startDate, endDate);
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại");
    }
  };

  const toggleSelectAll = () => {
    if (selectedQueries.length === logs.length) {
      setSelectedQueries([]);
    } else {
      setSelectedQueries(logs.map((log) => log.query));
    }
  };

  const toggleSelect = (query: string) => {
    if (selectedQueries.includes(query)) {
      setSelectedQueries(selectedQueries.filter((q) => q !== query));
    } else {
      setSelectedQueries([...selectedQueries, query]);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Fixed Top Section */}
      {/* Fixed Top Section: Header, Stats, Toolbar */}
      <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 -ml-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                  title="Quay lại"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800 flex items-center">
                  <FireIcon className="w-5 h-5 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-600 shrink-0" />
                  <span className="truncate">Yêu cầu tìm kiếm</span>
                </h1>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">
                  Các từ khóa người dùng quan tâm nhưng chưa có trong hệ thống
                </p>
              </div>
            </div>

            {/* Quick Stats optional: could show logs.length but totalPages/totalItems would be better if available */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <div className="px-2 py-0.5 bg-orange-50 rounded-lg border border-orange-100 flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-orange-600 uppercase">
                  MỚI
                </span>
                <span className="text-xs font-black text-orange-700">
                  {logs.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex justify-end lg:flex-row gap-3 mb-3">
            {/* <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm từ khóa..."
                className="block w-full pl-9 pr-9 h-10 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                value={search}
                onChange={handleSearch}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    reloadData();
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <CloseIcon className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                </button>
              )}
            </div> */}

            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClear={() => setPage(1)}
              className="w-full lg:w-auto"
              height="h-10"
            />
          </div>
        </div>
      </div>

      {/* Middle Section: Scrollable List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-7xl mx-auto w-full h-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
          <Table<SearchLog>
            className="flex-1 min-h-0"
            loading={loading}
            data={logs}
            keyExtractor={(item) => item.query}
            enableSelection
            selectedIds={selectedQueries}
            onSelectRow={toggleSelect}
            onSelectAll={toggleSelectAll}
            onBulkDelete={handleBulkDelete}
            bulkActionLabel="từ khóa"
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyImage={<SearchIcon className="w-16 h-16" />}
            emptyMessage="Không có dữ liệu tìm kiếm"
            columns={[
              {
                header: "Từ khóa",
                accessorKey: "query",
                className: "font-hanzi font-bold text-lg text-slate-800",
              },
              {
                header: "Số lần tìm",
                className: "text-center",
                cell: (log) => (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                    {log.count}
                  </span>
                ),
              },
              {
                header: "Lần cuối",
                className: "text-right font-mono text-xs text-slate-400",
                cell: (log) =>
                  new Date(log.lastSearched).toLocaleDateString("vi-VN"),
              },
              {
                header: "Hành động",
                className: "text-right",
                cell: (log) => (
                  <div className="flex justify-end gap-2">
                    <button
                      className="text-white hover:bg-red-700 font-bold text-xs bg-red-600 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/admin/idiom/insert?hanzi=${encodeURIComponent(
                          log.query
                        )}`;
                      }}
                    >
                      Thêm
                    </button>
                    <button
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all active:scale-95"
                      title="Xóa"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(log.query);
                      }}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchLogs;
