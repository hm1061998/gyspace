import React from "react";
import { useNavigate } from "react-router-dom";
import { SpinnerIcon } from "@/components/common/icons";
import Pagination from "@/components/common/Pagination";
import BulkActionBar from "@/components/common/BulkActionBar";
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";
import { useSavedVocabulary } from "@/hooks/useSavedVocabulary";
import SavedHeader from "@/components/saved/SavedHeader";
import SavedItem from "@/components/saved/SavedItem";
import { toast } from "@/libs/Toast";
import SavedEmptyState from "@/components/saved/SavedEmptyState";
import * as XLSX from "xlsx";
import { fetchSavedIdioms } from "@/services/api/userDataService";
import ProcessingOverlay from "@/components/common/ProcessingOverlay";
import { exportPDF } from "@/libs/ExportPDF/ExportPDFService";

interface SavedVocabularyProps {
  onBack: () => void;
}

const SavedVocabulary: React.FC<SavedVocabularyProps> = () => {
  const navigate = useNavigate();
  const {
    savedItems,
    loading,
    filter,
    setFilter,
    selectedIds,
    setSelectedIds,
    page,
    setPage,
    totalPages,
    totalItems,
    filteredItems,
    handleRemove,
    handleBulkDelete,
    toggleSelectAll,
    toggleSelect,
    isAllSelected,
    isSomeSelected,
  } = useSavedVocabulary();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processProgress, setProcessProgress] = React.useState(0);
  const [processStatus, setProcessStatus] = React.useState("");
  const [processType, setProcessType] = React.useState<"import" | "export">(
    "export"
  );
  const [processTitle, setProcessTitle] = React.useState("");

  const handleExportExcel = async () => {
    setIsProcessing(true);
    setProcessType("export");
    setProcessTitle("Đang xuất file Excel");
    setProcessProgress(10);
    setProcessStatus("Đang truy xuất dữ liệu...");

    try {
      const response = await fetchSavedIdioms({ limit: 1000 });
      setProcessProgress(50);
      setProcessStatus("Đang tạo cấu trúc tệp...");

      const exportData = response.data.map((item, index) => ({
        STT: index + 1,
        "CHỮ HÁN": item.hanzi,
        PINYIN: item.pinyin,
        "NGHĨA TIẾNG VIỆT": item.vietnameseMeaning,
        "CẤP ĐỘ": item.level,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sổ tay cá nhân");

      setProcessProgress(90);
      setProcessStatus("Đang tải dữ liệu xuống...");

      XLSX.writeFile(
        wb,
        `So_tay_ca_nhan_${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      setProcessProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        toast.success("Xuất file Excel thành công!");
      }, 500);
    } catch (error) {
      toast.error("Lỗi khi xuất file Excel");
      setIsProcessing(false);
    }
  };

  const handleExportPDF = async () => {
    setIsProcessing(true);
    setProcessType("export");
    setProcessTitle("Đang xuất file PDF");
    setProcessProgress(10);
    setProcessStatus("Đang khởi tạo ứng dụng...");

    try {
      const response = await fetchSavedIdioms({ limit: 1000 });

      const columns = ["STT", "Chữ Hán", "Pinyin", "Nghĩa tiếng Việt"];
      const rows = response.data.map((item, index) => [
        index + 1,
        item.hanzi,
        item.pinyin,
        item.vietnameseMeaning,
      ]);

      await exportPDF(
        {
          title: "Sổ tay cá nhân của tôi",
          columns,
          rows,
          filename: `So_tay_ca_nhan_${new Date().toISOString().slice(0, 10)}`,
        },
        (prog, status) => {
          setProcessProgress(prog);
          setProcessStatus(status);
        }
      );

      toast.success("Xuất file PDF thành công!");
      setTimeout(() => setIsProcessing(false), 500);
    } catch (error) {
      toast.error("Lỗi khi xuất file PDF");
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/50 relative">
      <ProcessingOverlay
        isOpen={isProcessing}
        progress={processProgress}
        status={processStatus}
        title={processTitle}
        type={processType}
      />
      <SavedHeader
        totalItems={totalItems}
        filter={filter}
        setFilter={setFilter}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        isExportingExcel={isProcessing && processTitle.includes("Excel")}
        isExportingPDF={isProcessing && processTitle.includes("PDF")}
      />

      {/* Middle Section: Scrollable List */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar px-3 md:px-4 pb-6 pt-2">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <SpinnerIcon className="w-10 h-10 text-red-600 animate-spin mb-4" />
              <p className="font-bold text-xs uppercase tracking-widest">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : savedItems.length === 0 ? (
            <SavedEmptyState
              isFilterActive={false}
              filterText=""
              onExplore={() => navigate("/")}
            />
          ) : (
            <>
              <BulkActionBar
                selectedCount={selectedIds.length}
                onDelete={handleBulkDelete}
                onClearSelection={() => setSelectedIds([])}
                label="mục"
                deleteLabel="Bỏ lưu đã chọn"
              />

              <SelectAllCheckbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={toggleSelectAll}
                subLabel={`(${filteredItems.length} mục)`}
                className="mb-4"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {filteredItems.map((item) => (
                  <SavedItem
                    key={item.hanzi}
                    item={item}
                    isSelected={selectedIds.includes(item.id!)}
                    onItemClick={(hanzi) =>
                      navigate(`/?query=${encodeURIComponent(hanzi)}`)
                    }
                    onRemove={handleRemove}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </div>
              {filteredItems.length === 0 && filter && (
                <SavedEmptyState
                  isFilterActive={true}
                  filterText={filter}
                  onExplore={() => {}}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      {totalPages > 1 && (
        <div className="flex-none bg-white border-t border-slate-200 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
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

export default SavedVocabulary;
