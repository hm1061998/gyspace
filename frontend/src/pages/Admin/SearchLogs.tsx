import React, { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  FireIcon,
  SearchIcon,
  SpinnerIcon,
  TrashIcon,
  CloseIcon,
} from "@/components/common/icons";
import Pagination from "@/components/common/Pagination";
import DateRangePicker from "@/components/common/DateRangePicker";
import BulkActionBar from "@/components/common/BulkActionBar";
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";
import {
  fetchSearchLogs,
  deleteSearchLog,
  bulkDeleteSearchLogs,
  SearchLog,
} from "@/services/api/idiomService";
import { toast } from "@/libs/Toast";
import { modalService } from "@/libs/Modal";

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
    fetchLogs();
  }, [page, search, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetchSearchLogs({
        page,
        limit: 20,
        search: search,
        filter: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
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
      fetchLogs();
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
      fetchLogs();
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

  const isAllSelected =
    logs.length > 0 && selectedQueries.length === logs.length;
  const isSomeSelected =
    selectedQueries.length > 0 && selectedQueries.length < logs.length;

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
          <div className="flex flex-col lg:flex-row gap-3 mb-3">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm từ khóa..."
                className="block w-full pl-9 pr-9 h-10 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <CloseIcon className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                </button>
              )}
            </div>

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
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6 pt-2">
          <BulkActionBar
            selectedCount={selectedQueries.length}
            onDelete={handleBulkDelete}
            onClearSelection={() => setSelectedQueries([])}
          />

          {/* Select All Checkbox */}
          {!loading && logs.length > 0 && (
            <SelectAllCheckbox
              checked={isAllSelected}
              indeterminate={isSomeSelected}
              onChange={toggleSelectAll}
              subLabel={`(${logs.length} từ khóa trong trang này)`}
              className="mb-4"
            />
          )}

          {/* Data Section */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <SpinnerIcon className="w-10 h-10 text-red-600 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <SearchIcon className="w-12 h-12 text-slate-200 mb-4" />
                <p className="italic text-sm">Không có dữ liệu tìm kiếm</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 w-12">
                            {/* Empty header or label */}
                          </th>
                          <th className="px-6 py-4 font-bold text-slate-600">
                            Từ khóa
                          </th>
                          <th className="px-6 py-4 font-bold text-slate-600 text-center">
                            Số lần tìm
                          </th>
                          <th className="px-6 py-4 font-bold text-slate-600 text-right">
                            Lần cuối
                          </th>
                          <th className="px-6 py-4 font-bold text-slate-600 text-right">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {logs.map((log, index) => (
                          <tr
                            key={index}
                            className={`hover:bg-slate-50/50 transition-colors group ${
                              selectedQueries.includes(log.query)
                                ? "bg-indigo-50/30"
                                : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedQueries.includes(log.query)}
                                onChange={() => toggleSelect(log.query)}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4 font-bold font-hanzi text-slate-800 text-lg">
                              {log.query}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                                {log.count}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-slate-400 font-mono text-xs">
                              {new Date(log.lastSearched).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="text-white hover:bg-red-700 font-bold text-xs bg-red-600 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
                                  onClick={() => {
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
                                  onClick={() => handleDelete(log.query)}
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`bg-white p-4 rounded-2xl border transition-all shadow-sm relative ${
                        selectedQueries.includes(log.query)
                          ? "border-indigo-400 bg-indigo-50/30"
                          : "border-slate-100"
                      }`}
                    >
                      <label className="absolute top-4 left-4 z-10 w-full h-12 p-0! block cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedQueries.includes(log.query)}
                          onChange={() => toggleSelect(log.query)}
                          className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                        />
                      </label>

                      <div className="pl-8">
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-xl font-hanzi font-black text-slate-800">
                            {log.query}
                          </h2>
                          <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-100">
                            {log.count} lần tìm
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4 sm:mt-6">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {new Date(log.lastSearched).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                (window.location.href = `/admin/idiom/insert?hanzi=${encodeURIComponent(
                                  log.query
                                )}`)
                              }
                              className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-lg"
                            >
                              THÊM MỚI
                            </button>
                            <button
                              onClick={() => handleDelete(log.query)}
                              className="p-2 text-slate-300 hover:text-red-600"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      {totalPages > 1 && (
        <div className="flex-none bg-white border-t border-slate-200 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchLogs;
