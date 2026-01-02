import React, { useEffect, useState } from "react";
import {
  FireIcon,
  SearchIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/components/common/icons";
import Pagination from "@/components/common/Pagination";
import DateRangePicker from "@/components/common/DateRangePicker";
import BulkActionBar from "@/components/common/BulkActionBar";
import {
  fetchSearchLogs,
  deleteSearchLog,
  bulkDeleteSearchLogs,
  SearchLog,
} from "@/services/api/idiomService";
import { toast } from "@/services/ui/toastService";
import { modalService } from "@/services/ui/modalService";

const SearchLogs: React.FC = () => {
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
      const data = await fetchSearchLogs(page, 20, search, startDate, endDate);
      setLogs(data.data);
      setTotalPages(data.meta.lastPage);
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
    <div className="max-w-5xl mx-auto w-full animate-pop">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FireIcon className="w-6 h-6 text-orange-500" />
            Mọi người đã tìm
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Các từ khóa người dùng tìm kiếm nhưng chưa có trong hệ thống
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo từ khóa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 hover:border-indigo-300 transition-all font-medium text-slate-700"
            />
          </div>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClear={() => setPage(1)}
            className="sm:w-96"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionBar
        selectedCount={selectedQueries.length}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedQueries([])}
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <SpinnerIcon className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic">
            Không có dữ liệu tìm kiếm
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isSomeSelected;
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                    />
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
                      {new Date(log.lastSearched).toLocaleDateString("vi-VN")}
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
                          Thêm từ này
                        </button>
                        <button
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all active:scale-95"
                          title="Xóa khỏi danh sách"
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
        )}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="justify-center"
        />
      </div>
    </div>
  );
};

export default SearchLogs;
