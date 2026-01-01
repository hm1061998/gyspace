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
} from "@/services/api/idiomService";
import { Idiom } from "@/types";
import { useNavigate } from "react-router";
import { confirmService } from "@/services/ui/confirmService";
import { toast } from "@/services/ui/toastService";
import FormSelect from "@/components/common/FormSelect";
import Input from "@/components/common/Input";

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

  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter State
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedType, setSelectedType] = useState("");

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
        selectedType
      );
      setIdioms(response.data);
      setTotalPages(response.meta.lastPage);
      setTotalItems(response.meta.total);
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

    confirmService.show({
      title: "Xác nhận xóa?",
      message: `Bạn có chắc chắn muốn xóa từ "${hanzi}" không? Hành động này không thể hoàn tác.`,
      type: "danger",
      confirmText: "Xóa ngay",
      cancelText: "Hủy",
      onConfirm: async () => {
        await deleteIdiom(id);
        toast.success("Đã xóa thành công!");
        loadIdioms();
      },
    });
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onEdit(id);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  return (
    <div className="max-w-6xl w-full mx-auto animate-pop">
      <div className="flex flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center w-auto">
          <h1 className="text-2xl font-hanzi font-bold text-slate-800">
            Kho từ vựng ({totalItems})
          </h1>
        </div>

        <div className="flex items-center gap-3">
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
              className={`flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-md font-bold text-sm ${
                isImporting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isImporting ? (
                <SpinnerIcon className="w-5 h-5" />
              ) : (
                <UploadIcon className="w-5 h-5" />
              )}
              <span>Import Excel</span>
            </label>
          </div>

          <button
            onClick={() => {
              navigate("/admin/idiom/insert");
            }}
            className="flex items-center justify-between px-4 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl transition-all shadow-md font-bold text-sm"
          >
            <div className="flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" /> <span>Thêm mới</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Tìm theo hán tự, pinyin, ý nghĩa..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 focus:ring-red-200 focus:border-red-400"
          />
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
        </div>
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
          className="min-w-[140px] !py-2"
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
          className="min-w-[160px] !py-2"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <SpinnerIcon className="w-8 h-8 text-red-600" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : idioms.length === 0 ? (
        <div className="text-center text-slate-400 py-20">
          <p>Không tìm thấy kết quả phù hợp.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {idioms.map((item) => (
              <div
                key={item.id}
                onClick={() => onEdit(item.id)}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-4 border-t border-slate-100">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`flex items-center px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                  page === 1
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-red-300"
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Trang trước
              </button>

              <span className="text-slate-500 font-bold text-sm">
                Trang {page} / {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`flex items-center px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                  page === totalPages
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-red-300"
                }`}
              >
                Trang sau
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VocabularyList;
