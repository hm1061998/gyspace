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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchExercises, deleteExercise } from "@/services/api/exerciseService";
import { Exercise, ExerciseType } from "@/types";
import { modalService } from "@/libs/Modal";
import { toast } from "@/libs/Toast";

const ExerciseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await fetchExercises();
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

            <button
              onClick={() => navigate("/admin/exercises/new")}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
            >
              <PlusIcon size={18} />
              Thêm bài tập
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
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
              <button
                onClick={() => navigate("/admin/exercises/new")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all"
              >
                <PlusIcon size={20} />
                Tạo ngay
              </button>
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
