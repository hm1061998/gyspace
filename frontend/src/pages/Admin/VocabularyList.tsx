import React, { useEffect, useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import {
  ArrowLeftIcon,
  SpinnerIcon,
  SearchIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UploadIcon,
  DocumentIcon,
  ListBulletIcon,
  CloseIcon,
} from "@/components/common/icons";
import {
  fetchStoredIdioms,
  deleteIdiom,
  bulkCreateIdioms,
  bulkDeleteIdioms,
} from "@/services/api/idiomService";
import { Idiom } from "@/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { modalService } from "@/libs/Modal";
import { toast } from "@/libs/Toast";
import FormSelect from "@/components/common/FormSelect";
import Pagination from "@/components/common/Pagination";
import BulkActionBar from "@/components/common/BulkActionBar";
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";

interface VocabularyListProps {
  onBack: () => void;
  onSelect: (idiomHanzi: string) => void;
  onEdit: (id: string) => void;
}

const VocabularyList: React.FC<VocabularyListProps> = ({
  onBack,
  onSelect,
  onEdit,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter & Sort State
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Sort from URL or default
  const sortParam = searchParams.get("sort") || "createdAt";
  const orderParam = (searchParams.get("order") as "ASC" | "DESC") || "DESC";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filter]);

  useEffect(() => {
    loadIdioms();
  }, [page, debouncedFilter, selectedLevel, selectedType]);

  // Simulated progress for import
  useEffect(() => {
    let interval: any;
    if (isImporting) {
      setImportProgress(0);
      setImportStatus("Đang đọc file Excel...");
      interval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev < 30) {
            setImportStatus("Đang phân tích dữ liệu...");
            return prev + Math.random() * 5;
          }
          if (prev < 70) {
            setImportStatus("Đang chuẩn bị gửi lên máy chủ...");
            return prev + Math.random() * 3;
          }
          if (prev < 95) {
            setImportStatus("Đang lưu vào cơ sở dữ liệu...");
            return prev + Math.random() * 1;
          }
          return prev;
        });
      }, 500);
    } else {
      setImportProgress(0);
      setImportStatus("");
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isImporting]);

  const loadIdioms = async () => {
    setLoading(true);
    try {
      const response = await fetchStoredIdioms({
        page,
        limit: 12,
        search: debouncedFilter,
        filter: {
          level: selectedLevel,
          type: selectedType,
        },
        sort: `${sortParam},${orderParam}`,
      });
      setIdioms(response.data);
      setTotalPages(response.meta.lastPage);
      setTotalItems(response.meta.total);
      setSelectedIds([]); // Clear selection when data changes
    } catch (err) {
      setError("Không thể tải danh sách từ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0)
          throw new Error("File trống hoặc sai định dạng.");

        setImportStatus(`Tìm thấy ${data.length} hàng dữ liệu...`);

        const mappedData = data
          .map((row) => {
            const hanzi = row["QUÁN DỤNG TỪ"] || row["CHỮ HÁN"] || row["hanzi"];
            if (!hanzi) return null;

            return {
              hanzi: String(hanzi).trim(),
              pinyin: String(row["PINYIN"] || "").trim(),
              vietnameseMeaning: String(
                row["NGHĨA TIẾNG VIỆT"] || row["NGHĨA"] || ""
              ).trim(),
              chineseDefinition: String(row["NGHĨA TIẾNG TRUNG"] || "").trim(),
              source: String(row["VỊ TRÍ XUẤT HIỆN"] || "").trim(),
              level: String(row["CẤP ĐỘ"] || "Trung cấp").trim(),
              origin: String(row["NGUỒN GỐC (NẾU CÓ)"] || "").trim(),
              type: "Quán dụng ngữ",
              figurativeMeaning: "",
              literalMeaning: "",
              examples: row["VÍ DỤ"]
                ? [
                    {
                      chinese: String(row["VÍ DỤ"]),
                      pinyin: "",
                      vietnamese: "",
                    },
                  ]
                : [],
              imageUrl: String(row["HÌNH ẢNH"] || "").trim(),
              videoUrl: String(row["LINK BÁO/VIDEO"] || "").trim(),
              usageContext: "",
            };
          })
          .filter(Boolean);

        if (mappedData.length === 0)
          throw new Error("Không tìm thấy dữ liệu hợp lệ.");

        await bulkCreateIdioms(mappedData);
        setImportProgress(100);
        setImportStatus("Hoàn tất!");

        // Wait a bit to show 100% before closing
        setTimeout(() => {
          toast.success(`Đã import thành công ${mappedData.length} từ vựng!`);
          setIsImporting(false);
          loadIdioms();
        }, 800);
      } catch (err: any) {
        toast.error(
          "Lỗi khi đọc file: " + (err.message || "Định dạng không hợp lệ.")
        );
        setIsImporting(false);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    hanzi: string
  ) => {
    e.stopPropagation();

    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa từ "${hanzi}" không? Hành động này không thể hoàn tác.`,
      "Xác nhận xóa?"
    );

    if (confirmed) {
      await deleteIdiom(id);
      toast.success("Đã xóa thành công!");
      loadIdioms();
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onEdit(id);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một mục để xóa");
      return;
    }

    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} từ vựng đã chọn không? Hành động này không thể hoàn tác.`,
      "Xác nhận xóa?"
    );

    if (!confirmed) return;

    try {
      await bulkDeleteIdioms(selectedIds);
      toast.success(`Đã xóa ${selectedIds.length} từ vựng thành công!`);
      loadIdioms();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === idioms.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(idioms.map((idiom) => idiom.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected =
    idioms.length > 0 && selectedIds.length === idioms.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < idioms.length;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 relative">
      {/* Import Overlay */}
      {isImporting && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-4xl p-8 sm:p-12 shadow-2xl max-w-md w-full mx-4 flex flex-col items-center text-center space-y-6 transform animate-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center animate-pulse">
                <DocumentIcon className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg">
                <SpinnerIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                Đang xử lý dữ liệu
              </h3>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest min-h-[1rem]">
                {importStatus}
              </p>
            </div>

            <div className="w-full space-y-3">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out shadow-lg shadow-emerald-100"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Tiến trình</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Vui lòng không đóng cửa sổ này cho đến khi quá trình hoàn tất.
            </p>
          </div>
        </div>
      )}

      {/* Top Section: Title & Actions & Filters */}
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
                  <ListBulletIcon className="w-5 h-5 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-600 shrink-0" />
                  <span className="truncate">Kho từ vựng</span>
                </h1>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">
                  Quản lý và tra cứu toàn bộ danh sách từ vựng trong hệ thống
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <div className="px-2 py-0.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  TỔNG
                </span>
                <span className="text-xs font-black text-slate-700">
                  {totalItems || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Toolbar: Search, Filters & Main Actions */}
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm từ vựng..."
                  className="block w-full pl-9 pr-9 h-10 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                {filter && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilter("");
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <CloseIcon className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleExcelImport}
                    accept=".xlsx, .xls"
                    className="hidden"
                    id="excel-upload-list"
                  />
                  <label
                    htmlFor="excel-upload-list"
                    className={`flex items-center justify-center gap-2 px-3 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer font-bold text-xs ${
                      isImporting ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                    title="Nhập từ Excel"
                  >
                    {isImporting ? (
                      <SpinnerIcon className="w-4 h-4" />
                    ) : (
                      <UploadIcon className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline uppercase tracking-wider">
                      Excel
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => navigate("/admin/idiom/insert")}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 h-10 bg-red-700 text-white rounded-xl font-bold text-xs hover:bg-red-800 transition-all shadow-lg shadow-red-100 active:scale-95"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline uppercase tracking-wider">
                    Thêm từ mới
                  </span>
                  <span className="sm:hidden uppercase tracking-wider">
                    Thêm
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <FormSelect
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e);
                  setPage(1);
                }}
                options={[
                  { value: "", label: "Cấp độ" },
                  { value: "Sơ cấp", label: "Sơ cấp" },
                  { value: "Trung cấp", label: "Trung cấp" },
                  { value: "Cao cấp", label: "Cao cấp" },
                ]}
                className="min-w-[100px] h-8 bg-slate-50 border-slate-200 rounded-lg text-[10px] font-bold"
              />
              <FormSelect
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e);
                  setPage(1);
                }}
                options={[
                  { value: "", label: "Loại từ" },
                  { value: "Quán dụng ngữ", label: "Quán dụng ngữ" },
                  { value: "Thành ngữ (Chengyu)", label: "Thành ngữ" },
                  { value: "Tiếng lóng", label: "Tiếng lóng" },
                ]}
                className="min-w-[120px] h-8 bg-slate-50 border-slate-200 rounded-lg text-[10px] font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Scrollable List */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6 pt-2">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <SpinnerIcon className="w-8 h-8 text-red-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : idioms.length === 0 ? (
            <div className="text-center text-slate-400 py-16">
              <p>Không tìm thấy kết quả phù hợp.</p>
            </div>
          ) : (
            <>
              {/* Bulk Actions Bar */}
              <BulkActionBar
                selectedCount={selectedIds.length}
                onDelete={handleBulkDelete}
                onClearSelection={() => setSelectedIds([])}
                label="từ vựng"
              />

              <SelectAllCheckbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={toggleSelectAll}
                subLabel={`(${idioms.length} từ trong trang này)`}
                className="mb-4"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {idioms.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onEdit(item.id)}
                    className={`bg-white p-4 sm:p-5 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition-all group relative overflow-hidden ${
                      selectedIds.includes(item.id)
                        ? "border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-50"
                        : "border-slate-200 hover:border-red-200"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between items-start mb-2 pl-8">
                      <h2 className="text-xl sm:text-2xl font-hanzi font-bold text-slate-800 group-hover:text-red-700 transition-colors">
                        {item.hanzi}
                      </h2>
                      <div className="items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                        <button
                          onClick={(e) => handleEdit(e, item.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, item.id, item.hanzi)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Mobile-only actions */}
                      <div className="sm:hidden flex space-x-2">
                        <PencilIcon className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <p className="text-red-600 font-bold text-xs sm:text-sm mb-2 uppercase tracking-wide">
                      {item.pinyin}
                    </p>
                    <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
                      {item.vietnameseMeaning}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section: Fixed Pagination */}
      {totalPages > 1 && (
        <div className="flex-none bg-white border-t border-slate-200 py-3 shadow-[0_-4px_6_rgba(0,0,0,0.05)]">
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

export default VocabularyList;
