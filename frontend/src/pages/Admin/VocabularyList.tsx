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
} from "@/components/common/icons";
import {
  fetchStoredIdioms,
  deleteIdiom,
  bulkCreateIdioms,
  bulkDeleteIdioms,
} from "@/services/api/idiomService";
import { Idiom } from "@/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { modalService } from "@/services/ui/modalService";
import { toast } from "@/services/ui/toastService";
import FormSelect from "@/components/common/FormSelect";
import Input from "@/components/common/Input";
import Pagination from "@/components/common/Pagination";
import BulkActionBar from "@/components/common/BulkActionBar";

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

  const loadIdioms = async () => {
    setLoading(true);
    try {
      const response = await fetchStoredIdioms(
        page,
        12,
        debouncedFilter,
        selectedLevel,
        selectedType,
        sortParam,
        orderParam
      );
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
        toast.success(`Đã import thành công ${mappedData.length} từ vựng!`);
        loadIdioms();
      } catch (err: any) {
        toast.error(
          "Lỗi khi đọc file: " + (err.message || "Định dạng không hợp lệ.")
        );
      } finally {
        setIsImporting(false);
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
    <div className="max-w-6xl w-full mx-auto animate-pop">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-hanzi font-bold text-slate-800">
            Kho từ vựng ({totalItems})
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-initial">
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
              className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-md font-bold text-xs md:text-sm ${
                isImporting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isImporting ? (
                <SpinnerIcon className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <UploadIcon className="w-4 h-4 md:w-5 md:h-5" />
              )}
              <span className="whitespace-nowrap">Import Excel</span>
            </label>
          </div>

          <button
            onClick={() => {
              navigate("/admin/idiom/insert");
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center px-3 md:px-4 py-2.5 md:py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl transition-all shadow-md font-bold text-xs md:text-sm group"
          >
            <div className="flex items-center space-x-2">
              <PlusIcon className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-90" />
              <span className="whitespace-nowrap">Thêm mới</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Input
            placeholder="Tìm theo hán tự, pinyin, ý nghĩa..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 !py-2.5 focus:ring-red-200 focus:border-red-400 text-sm"
          />
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <FormSelect
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e);
              setPage(1);
            }}
            options={[
              { value: "", label: "Tất cả cấp độ" },
              { value: "Sơ cấp", label: "Sơ cấp" },
              { value: "Trung cấp", label: "Trung cấp" },
              { value: "Cao cấp", label: "Cao cấp" },
            ]}
            className="flex-1 lg:min-w-[140px] !py-2.5 text-xs md:text-sm"
          />
          <FormSelect
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e);
              setPage(1);
            }}
            options={[
              { value: "", label: "Tất cả loại từ" },
              { value: "Quán dụng ngữ", label: "Quán dụng ngữ" },
              { value: "Thành ngữ (Chengyu)", label: "Thành ngữ" },
              { value: "Tiếng lóng", label: "Tiếng lóng" },
            ]}
            className="flex-1 lg:min-w-[160px] !py-2.5 text-xs md:text-sm"
          />
        </div>
      </div>

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

          {/* Select All Checkbox */}
          <div className="mb-3 flex items-center gap-2">
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
            <label
              className="text-sm font-medium text-slate-600 cursor-pointer"
              onClick={toggleSelectAll}
            >
              Chọn tất cả ({idioms.length} mục)
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {idioms.map((item) => (
              <div
                key={item.id}
                onClick={() => onEdit(item.id)}
                className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all group relative overflow-hidden ${
                  selectedIds.includes(item.id)
                    ? "border-indigo-400 bg-indigo-50/30"
                    : "border-slate-200 hover:border-red-200"
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-3 left-3 z-10">
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

                <div className="flex justify-between items-start mb-2 pl-6">
                  <h2 className="text-2xl font-hanzi font-bold text-slate-800 group-hover:text-red-700">
                    {item.hanzi}
                  </h2>
                  <div className="flex items-center space-x-1">
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
                </div>
                <p className="text-red-500 font-medium text-sm mb-2">
                  {item.pinyin}
                </p>
                <p className="text-slate-600 text-sm line-clamp-2">
                  {item.vietnameseMeaning}
                </p>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="pt-4 border-t border-slate-100"
          />
        </>
      )}
    </div>
  );
};

export default VocabularyList;
