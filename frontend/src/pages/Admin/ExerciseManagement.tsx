import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowLeftIcon,
  Loader2 as SpinnerIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  LayoutGridIcon,
  DownloadIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  fetchAdminExercises,
  deleteExercise,
  bulkCreateExercises,
} from "@/services/api/exerciseService";
import { Exercise, ExerciseType } from "@/types";
import { modalService } from "@/libs/Modal";
import { toast } from "@/libs/Toast";
import ProcessingOverlay from "@/components/common/ProcessingOverlay";
import ImportModal from "@/components/admin/ImportModal";
import { UploadIcon } from "@/components/common/icons";

const ExerciseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processStatus, setProcessStatus] = useState("");
  const [processTitle, setProcessTitle] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminExercises();
      setExercises(data);
    } catch (err) {
      toast.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const handleExportTemplate = () => {
    const templateData = [
      {
        "TIÊU ĐỀ": "Bài tập trắc nghiệm mẫu (MULTIPLE_CHOICE)",
        "MÔ TẢ": "Chọn đáp án đúng nhất",
        LOẠI: "MULTIPLE_CHOICE",
        "ĐỘ KHÓ": "easy",
        ĐIỂM: 10,
        "CÂU HỎI": "Thủ đô của Việt Nam là gì?",
        A: "Hồ Chí Minh",
        B: "Hà Nội",
        C: "Đà Nẵng",
        D: "Hải Phòng",
        "ĐÁP ÁN ĐÚNG": "B",
        "VĂN BẢN": "",
        "TỪ VỰNG": "",
        "ĐÁP ÁN": "",
      },
      {
        "TIÊU ĐỀ": "Bài tập điền từ mẫu (FILL_BLANKS)",
        "MÔ TẢ": "Điền từ thích hợp vào chỗ trống",
        LOẠI: "FILL_BLANKS",
        "ĐỘ KHÓ": "medium",
        ĐIỂM: 20,
        "CÂU HỎI": "",
        A: "",
        B: "",
        C: "",
        D: "",
        "ĐÁP ÁN ĐÚNG": "",
        "VĂN BẢN": "Hôm nay trời [0], tôi đi [1] cùng bạn.",
        "TỪ VỰNG": "đẹp,chơi,xấu,học",
        "ĐÁP ÁN": "đẹp,chơi",
      },
      {
        "TIÊU ĐỀ": "Bài tập nối cặp mẫu (MATCHING)",
        "MÔ TẢ": "Nối từ tiếng Việt với tiếng Anh",
        LOẠI: "MATCHING",
        "ĐỘ KHÓ": "easy",
        ĐIỂM: 15,
        "CÂU HỎI": "",
        A: "",
        B: "",
        C: "",
        D: "",
        "ĐÁP ÁN ĐÚNG": "",
        "VĂN BẢN": "Con chó - Dog | Con mèo - Cat | Con heo - Pig",
        "TỪ VỰNG": "",
        "ĐÁP ÁN": "",
      },
      {
        "TIÊU ĐỀ": "Hướng dẫn sử dụng (Xóa dòng này khi nhập)",
        "MÔ TẢ": "LOẠI: MULTIPLE_CHOICE / FILL_BLANKS / MATCHING.",
        LOẠI: "",
        "ĐỘ KHÓ": "easy / medium / hard",
        ĐIỂM: 0,
        "CÂU HỎI": "Dùng cho Trắc nghiệm",
        A: "Option A",
        B: "Option B",
        C: "Option C",
        D: "Option D",
        "ĐÁP ÁN ĐÚNG": "A/B/C/D",
        "VĂN BẢN":
          "Điền từ: 'Văn bản [0]...'. Nối cặp: 'Trái - Phải | Trái - Phải'",
        "TỪ VỰNG": "Điền từ: Các từ gây nhiễu và từ đúng, cách nhau dấu phẩy",
        "ĐÁP ÁN": "Điền từ: Từ đúng theo thứ tự [0],[1], cách nhau dấu phẩy",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Bai_Tap.xlsx");
  };

  const handleExcelImport = (file: File) => {
    setIsImportModalOpen(false); // Close modal when processing starts
    if (!file) return;

    setIsProcessing(true);
    setProcessTitle("Đang nhập dữ liệu bài tập");
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
            const title = row["TIÊU ĐỀ"] || row["TITLE"];
            if (!title || String(title).includes("Hướng dẫn sử dụng"))
              return null;

            const typeRaw = (
              row["LOẠI"] ||
              row["TYPE"] ||
              "MULTIPLE_CHOICE"
            ).toUpperCase();
            let type = ExerciseType.MULTIPLE_CHOICE;
            if (typeRaw.includes("MATCH")) type = ExerciseType.MATCHING;
            if (typeRaw.includes("FILL") || typeRaw.includes("ĐIỀN"))
              type = ExerciseType.FILL_BLANKS;

            const baseEx = {
              title: String(title).trim(),
              description: String(row["MÔ TẢ"] || row["DESCRIPTION"] || ""),
              type,
              difficulty: (
                row["ĐỘ KHÓ"] ||
                row["DIFFICULTY"] ||
                "easy"
              ).toLowerCase(),
              points: Number(row["ĐIỂM"] || row["POINTS"] || 10),
            };

            let content: any = {};

            if (type === ExerciseType.MULTIPLE_CHOICE) {
              content = {
                question: String(row["CÂU HỎI"] || row["QUESTION"] || ""),
                options: [
                  { id: "A", text: String(row["A"] || "") },
                  { id: "B", text: String(row["B"] || "") },
                  { id: "C", text: String(row["C"] || "") },
                  { id: "D", text: String(row["D"] || "") },
                ],
                correctOptionId: String(
                  row["ĐÁP ÁN ĐÚNG"] || row["CORRECT"] || "A"
                ).toUpperCase(),
              };
            } else if (type === ExerciseType.FILL_BLANKS) {
              content = {
                text: String(row["VĂN BẢN"] || row["TEXT"] || ""),
                wordBank: String(row["TỪ VỰNG"] || row["WORDBANK"] || "")
                  .split(",")
                  .map((s) => s.trim()),
                correctAnswers: String(row["ĐÁP ÁN"] || row["ANSWERS"] || "")
                  .split(",")
                  .map((s, idx) => ({ position: idx, word: s.trim() })),
              };
            } else if (type === ExerciseType.MATCHING) {
              const rawText = String(row["VĂN BẢN"] || row["TEXT"] || "");
              const pairs = rawText
                .split("|")
                .map((pair) => {
                  const parts = pair.split("-");
                  if (parts.length < 2) return null;
                  const left = parts[0].trim();
                  const right = parts.slice(1).join("-").trim(); // Re-join if multiple dashes
                  return { left, right };
                })
                .filter((p) => p && p.left && p.right);

              content = { pairs };
            }

            return { ...baseEx, content };
          })
          .filter(Boolean);

        if (mappedData.length === 0)
          throw new Error("Không tìm thấy dữ liệu hợp lệ.");

        setProcessProgress(60);
        setProcessStatus("Đang lưu vào hệ thống...");
        // @ts-ignore
        await bulkCreateExercises(mappedData);

        setProcessProgress(100);
        setProcessStatus("Hoàn tất!");

        setTimeout(() => {
          toast.success(`Đã import thành công ${mappedData.length} bài tập!`);
          setIsProcessing(false);
          loadExercises();
        }, 800);
      } catch (err: any) {
        toast.error(
          "Lỗi khi đọc file: " + (err.message || "Định dạng không hợp lệ.")
        );
        setIsProcessing(false);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await modalService.danger(
      `Bạn có chắc muốn xóa bài tập "${title}"?`,
      "Xác nhận xóa"
    );
    if (confirmed) {
      try {
        await deleteExercise(id);
        toast.success("Đã xóa bài tập");
        loadExercises();
      } catch (err) {
        toast.error("Xóa thất bại");
      }
    }
  };

  const getBadgeColor = (type: ExerciseType) => {
    switch (type) {
      case ExerciseType.MATCHING:
        return "bg-blue-100 text-blue-600";
      case ExerciseType.MULTIPLE_CHOICE:
        return "bg-purple-100 text-purple-600";
      case ExerciseType.FILL_BLANKS:
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTypeText = (type: ExerciseType) => {
    switch (type) {
      case ExerciseType.MATCHING:
        return "Dạng nối";
      case ExerciseType.MULTIPLE_CHOICE:
        return "Trắc nghiệm ABCD";
      case ExerciseType.FILL_BLANKS:
        return "Điền từ";
      default:
        return type;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDownloadTemplate={handleExportTemplate}
        onFileSelect={handleExcelImport}
        isProcessing={isProcessing}
      />

      {/* Header */}
      <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin")}
                className="p-2 -ml-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
              >
                <ArrowLeftIcon size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                  <LayoutGridIcon className="w-6 h-6 mr-3 text-red-600" />
                  Quản lý bài tập
                </h1>
                <p className="text-slate-500 text-xs hidden sm:block">
                  Tạo và quản lý các bài luyện tập cho người dùng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Import Button */}
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="group flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100 hover:border-emerald-200 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                title="Nhập dữ liệu từ file Excel"
              >
                <UploadIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Import</span>
              </button>

              {/* Divider */}
              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

              {/* Add New Button */}
              <button
                onClick={() => navigate("/admin/exercises/new")}
                className="group flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 hover:shadow-red-300 active:scale-95"
              >
                <PlusIcon
                  size={18}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
                <span className="hidden sm:inline">Tạo mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <ProcessingOverlay
          isOpen={isProcessing}
          progress={processProgress}
          status={processStatus}
          title={processTitle}
          type="import"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <SpinnerIcon className="w-10 h-10 text-red-600 animate-spin" />
            </div>
          ) : exercises.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Chưa có bài tập nào
              </h3>
              <p className="text-slate-400 mb-6">
                Hãy tạo bài tập đầu tiên để người dùng luyện tập
              </p>
              <div className="flex justify-center gap-3">
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleExcelImport}
                    accept=".xlsx, .xls"
                    className="hidden"
                    id="excel-upload-empty"
                  />
                  <label
                    htmlFor="excel-upload-empty"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <UploadIcon className="w-5 h-5" />
                    Import Excel
                  </label>
                </div>
                <button
                  onClick={() => navigate("/admin/exercises/new")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all"
                >
                  <PlusIcon size={20} />
                  Tạo ngay
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getBadgeColor(
                          exercise.type
                        )}`}
                      >
                        {getTypeText(exercise.type)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            navigate(`/admin/exercises/edit/${exercise.id}`)
                          }
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <PencilIcon size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(exercise.id, exercise.title)
                          }
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-red-600 transition-colors">
                      {exercise.title}
                    </h3>

                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                      {exercise.description || "Không có mô tả"}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <CheckCircle2Icon
                          className="text-green-500"
                          size={16}
                        />
                        <span className="text-xs font-bold text-slate-600">
                          {exercise.points} điểm
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg border uppercase tracking-tighter
                        ${
                          exercise.difficulty === "easy"
                            ? "border-green-100 text-green-600 bg-green-50"
                            : exercise.difficulty === "medium"
                            ? "border-amber-100 text-amber-600 bg-amber-50"
                            : "border-red-100 text-red-600 bg-red-50"
                        }`}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 group-hover:w-full w-4 
                      ${
                        exercise.type === ExerciseType.MATCHING
                          ? "bg-blue-500"
                          : exercise.type === ExerciseType.MULTIPLE_CHOICE
                          ? "bg-purple-500"
                          : "bg-orange-500"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseManagement;
