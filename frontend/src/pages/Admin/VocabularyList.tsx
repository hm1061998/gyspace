import React, { useEffect, useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import {
  ArrowLeftIcon,
  SpinnerIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UploadIcon,
  ListBulletIcon,
  CloseIcon,
} from "@/components/common/icons";
import {
  useStoredIdiomsList,
  useDeleteIdiomMutation,
  useBulkDeleteIdiomsMutation,
  useImportIdiomsMutation,
} from "@/hooks/queries/useIdioms";
import { useNavigate, useSearchParams } from "react-router-dom";
import { modalService } from "@/libs/Modal";
import { toast } from "@/libs/Toast";
import FormSelect from "@/components/common/FormSelect";
import Pagination from "@/components/common/Pagination";
import BulkActionBar from "@/components/common/BulkActionBar";
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";
import ProcessingOverlay from "@/components/common/ProcessingOverlay";
import ImportModal from "@/components/admin/ImportModal";

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

  // Processing State (Import/Export)
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processStatus, setProcessStatus] = useState("");
  const [processType, setProcessType] = useState<"import" | "export">("import");
  const [processTitle, setProcessTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);

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

  // Query
  const {
    data: response,
    isLoading: loading,
    error: queryError,
  } = useStoredIdiomsList({
    page,
    limit: 12,
    search: debouncedFilter,
    filter: {
      level: selectedLevel,
      type: selectedType,
    },
    sort: `${sortParam},${orderParam}`,
  });

  const idioms = response?.data || [];
  const totalPages = response?.meta?.lastPage || 1;
  const totalItems = response?.meta?.total || 0;

  // Mutations
  const { mutateAsync: deleteSingle } = useDeleteIdiomMutation();
  const { mutateAsync: deleteBulk } = useBulkDeleteIdiomsMutation();
  const { mutateAsync: importIdioms } = useImportIdiomsMutation();

  // Reset selection on page change or filter change
  useEffect(() => {
    setSelectedIds([]);
  }, [page, debouncedFilter, selectedLevel, selectedType]);

  // Loading error handling
  useEffect(() => {
    if (queryError) {
      setError("Không thể tải danh sách từ. Vui lòng thử lại.");
    } else {
      setError(null);
    }
  }, [queryError]);

  // Simulated progress for processing
  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessProgress((prev) => {
          if (prev < 90) {
            return prev + Math.random() * 5;
          }
          return prev;
        });
      }, 400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing]);

  const handleExportTemplate = () => {
    const templateData = [
      {
        "QUÁN DỤNG TỪ": "不客气",
        PINYIN: "bù kè qi",
        "NGHĨA TIẾNG VIỆT": "Đừng khách sáo",
        "NGHĨA TIẾNG TRUNG": "不用谢",
        "VỊ TRÍ XUẤT HIỆN": "HSK 1",
        "CẤP ĐỘ": "Sơ cấp",
        "NGUỒN GỐC (NẾU CÓ)": "",
        "VÍ DỤ": "A: 谢谢! - B: 不客气。",
        "HÌNH ẢNH": "",
        "LINK BÁO/VIDEO": "",
      },
      {
        "QUÁN DỤNG TỪ": "Hướng dẫn sử dụng (Xóa khi nhập)",
        PINYIN: "Dành cho trường bắt buộc",
        "NGHĨA TIẾNG VIỆT": "Bắt buộc",
        "NGHĨA TIẾNG TRUNG": "Tùy chọn",
        "VỊ TRÍ XUẤT HIỆN": "Tùy chọn",
        "CẤP ĐỘ": "Sơ cấp / Trung cấp / Cao cấp",
        "NGUỒN GỐC (NẾU CÓ)": "Tùy chọn",
        "VÍ DỤ": "Ví dụ đi kèm",
        "HÌNH ẢNH": "Link ảnh",
        "LINK BÁO/VIDEO": "Link video",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Tu_Vung");
    XLSX.writeFile(wb, "Template_Tu_Vung.xlsx");
  };

  const handleExcelImport = (file: File) => {
    setIsImportModalOpen(false);
    if (!file) return;

    setIsProcessing(true);
    setProcessType("import");
    setProcessTitle("Đang nhập dữ liệu");
    setProcessProgress(10);
    setProcessStatus("Đang đọc file Excel...");

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

        setProcessProgress(30);
        setProcessStatus(`Tìm thấy ${data.length} hàng dữ liệu. Đang xử lý...`);

        const mappedData = data
          .map((row) => {
            const hanzi = row["QUÁN DỤNG TỪ"] || row["CHỮ HÁN"] || row["hanzi"];
            if (!hanzi || String(hanzi).includes("Hướng dẫn sử dụng"))
              return null;

            const parseExamples = (rawText: string) => {
              if (!rawText) return [];
              const text = rawText.replace(/\r\n/g, "\n").trim();

              // Regex matches "列 1：" or "例 2:" variations
              const delimiterRegex = /(?:列|例)\s*\d+\s*[：:]/g;

              if (!delimiterRegex.test(text)) {
                return [
                  {
                    chinese: text,
                    pinyin: "",
                    vietnamese: "",
                  },
                ];
              }

              return text
                .split(delimiterRegex)
                .map((p) => p.trim())
                .filter(Boolean)
                .map((content) => ({
                  chinese: content,
                  pinyin: "",
                  vietnamese: "",
                }));
            };

            return {
              hanzi: String(hanzi).trim(),
              pinyin: String(row["PINYIN"] || "").trim(),
              vietnameseMeaning: String(
                row["NGHĨA TIẾNG VIỆT"] || row["NGHĨA"] || "",
              ).trim(),
              chineseDefinition: String(row["NGHĨA TIẾNG TRUNG"] || "").trim(),
              source: String(row["VỊ TRÍ XUẤT HIỆN"] || "").trim(),
              level: String(row["CẤP ĐỘ"] || "Trung cấp").trim(),
              origin: String(row["NGUỒN GỐC (NẾU CÓ)"] || "").trim(),
              type: "Quán dụng ngữ",
              figurativeMeaning: "",
              literalMeaning: "",
              examples: row["VÍ DỤ"] ? parseExamples(String(row["VÍ DỤ"])) : [],
              imageUrl: String(row["HÌNH ẢNH"] || "").trim(),
              videoUrl: String(row["LINK BÁO/VIDEO"] || "").trim(),
              usageContext: "",
            };
          })
          .filter(Boolean);

        if (mappedData.length === 0)
          throw new Error("Không tìm thấy dữ liệu hợp lệ.");

        setProcessProgress(60);
        setProcessStatus("Đang lưu vào hệ thống...");
        await importIdioms(mappedData);

        setProcessProgress(100);
        setProcessStatus("Hoàn tất!");

        setTimeout(() => {
          toast.success(`Đã import thành công ${mappedData.length} từ vựng!`);
          setIsProcessing(false);
          // Auto-refectch handled by mutation onSuccess
        }, 800);
      } catch (err: any) {
        toast.error(
          "Lỗi khi đọc file: " + (err.message || "Định dạng không hợp lệ."),
        );
        setIsProcessing(false);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    hanzi: string,
  ) => {
    e.stopPropagation();

    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa từ "${hanzi}" không? Hành động này không thể hoàn tác.`,
      "Xác nhận xóa?",
    );

    if (confirmed) {
      await deleteSingle(id);
      toast.success("Đã xóa thành công!");
      // Auto-refetch
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
      "Xác nhận xóa?",
    );

    if (!confirmed) return;

    try {
      await deleteBulk(selectedIds);
      toast.success(`Đã xóa ${selectedIds.length} từ vựng thành công!`);
      // Auto-refetch
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
      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDownloadTemplate={handleExportTemplate}
        onFileSelect={handleExcelImport}
        isProcessing={isProcessing}
      />

      {/* Processing Overlay */}
      <ProcessingOverlay
        isOpen={isProcessing}
        progress={processProgress}
        status={processStatus}
        title={processTitle}
        type={processType}
      />

      {/* Top Section: Title & Actions & Filters */}
      <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-11 transition-all">
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
          <div className="flex flex-col gap-3 mb-3 ">
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

              {/* Action Buttons Group */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Import Button */}
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="group flex items-center justify-center gap-2 px-3 sm:px-4 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all font-bold text-xs shadow-sm active:scale-95"
                  title="Nhập từ Excel"
                >
                  <UploadIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Import</span>
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                {/* Add New Button */}
                <button
                  onClick={() => navigate("/admin/idiom/insert")}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 h-10 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                >
                  <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
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
            <div className="flex items-center gap-2 pb-1">
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
