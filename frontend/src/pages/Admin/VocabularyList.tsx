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
import { modalService } from "@/libs/Modal";
import { toast } from "@/libs/Toast";
import FormSelect from "@/components/common/FormSelect";
import Input from "@/components/common/Input";
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
    <div className="vocab-page-root">
      {/* Top Section: Title & Actions & Filters */}
      <div className="vocab-header">
        <div className="vocab-header-container">
          <div className="vocab-title-row">
            <div className="vocab-title-group">
              {onBack && (
                <button
                  onClick={onBack}
                  className="vocab-back-btn"
                  title="Quay lại"
                >
                  <ArrowLeftIcon className="dashboard-action-icon" />
                </button>
              )}
              <h1 className="vocab-page-title">
                Kho từ vựng <span className="vocab-count">({totalItems})</span>
              </h1>
            </div>

            <div className="vocab-actions-group">
              <div className="vocab-file-input-container">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleExcelImport}
                  accept=".xlsx, .xls"
                  className="vocab-file-input"
                  id="excel-upload-list"
                />
                <label
                  htmlFor="excel-upload-list"
                  className={`vocab-action-btn import ${
                    isImporting ? "disabled" : ""
                  }`}
                >
                  {isImporting ? (
                    <SpinnerIcon className="vocab-action-icon animate-spin" />
                  ) : (
                    <UploadIcon className="vocab-action-icon" />
                  )}
                  <span className="vocab-btn-text">Nhập Excel</span>
                </label>
              </div>

              <button
                onClick={() => {
                  navigate("/admin/idiom/insert");
                }}
                className="vocab-action-btn add group"
              >
                <PlusIcon className="vocab-action-icon group-hover:rotate-90" />
                <span className="vocab-btn-text">Thêm</span>
              </button>
            </div>
          </div>

          <div className="vocab-filter-bar">
            <div className="vocab-search-wrapper group">
              <SearchIcon className="vocab-search-icon" />
              <input
                type="text"
                placeholder="Tìm từ vựng..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="vocab-search-input"
              />
            </div>
            <div className="vocab-filter-group">
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
                className="vocab-select level"
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
                className="vocab-select type"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Scrollable List */}
      <div className="vocab-list-container custom-scrollbar">
        <div className="vocab-list-inner">
          {loading ? (
            <div className="vocab-loading">
              <SpinnerIcon className="dashboard-action-icon text-red-600" />
            </div>
          ) : error ? (
            <div className="vocab-error">{error}</div>
          ) : idioms.length === 0 ? (
            <div className="vocab-empty">
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

              <div className="vocab-grid">
                {idioms.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onEdit(item.id)}
                    className={`vocab-card group ${
                      selectedIds.includes(item.id) ? "is-selected" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="vocab-checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="vocab-checkbox"
                      />
                    </div>

                    <div className="vocab-card-header">
                      <h2 className="vocab-card-title">{item.hanzi}</h2>
                      <div className="vocab-card-actions">
                        <button
                          onClick={(e) => handleEdit(e, item.id)}
                          className="vocab-card-action-btn edit"
                          title="Sửa"
                        >
                          <PencilIcon className="vocab-card-action-icon" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, item.id, item.hanzi)}
                          className="vocab-card-action-btn delete"
                          title="Xóa"
                        >
                          <TrashIcon className="vocab-card-action-icon" />
                        </button>
                      </div>
                      {/* Mobile-only actions */}
                      <div className="vocab-card-mobile-actions">
                        <PencilIcon className="dashboard-action-icon text-slate-400" />
                      </div>
                    </div>
                    <p className="vocab-card-pinyin">{item.pinyin}</p>
                    <p className="vocab-card-meaning">
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
        <div className="vocab-footer">
          <div className="w-full px-4">
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
