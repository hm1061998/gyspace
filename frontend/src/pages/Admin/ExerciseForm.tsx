import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  ArrowLeftIcon,
  SaveIcon,
  TypeIcon,
  LayersIcon,
  HelpCircleIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createExercise,
  fetchExerciseById,
  updateExercise,
} from "@/services/api/exerciseService";
import { Exercise, ExerciseType } from "@/types";
import { toast } from "@/libs/Toast";
import FormSelect from "@/components/common/FormSelect";

// Sub-components
import MultipleChoiceForm from "@/components/admin/ExerciseForm/MultipleChoiceForm";
import MatchingForm from "@/components/admin/ExerciseForm/MatchingForm";
import FillBlanksForm from "@/components/admin/ExerciseForm/FillBlanksForm";

const ExerciseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const methods = useForm<Partial<Exercise>>({
    defaultValues: {
      type: ExerciseType.MULTIPLE_CHOICE,
      difficulty: "easy",
      points: 10,
      content: {
        question: "",
        options: [
          { id: "A", text: "" },
          { id: "B", text: "" },
          { id: "C", text: "" },
          { id: "D", text: "" },
        ],
        correctOptionId: "A",
        pairs: [{ left: "", right: "" }],
        text: "",
        wordBank: [],
        correctAnswers: [],
      },
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  const selectedType = watch("type");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      void (async () => {
        try {
          const data = await fetchExerciseById(id);
          reset(data);
        } catch (err) {
          toast.error("Không thể tải thông tin bài tập");
          navigate("/admin/exercises");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data: Partial<Exercise>) => {
    try {
      // Clean up content based on type before saving
      const finalContent: any = {};
      if (data.type === ExerciseType.MULTIPLE_CHOICE) {
        finalContent.question = data.content.question;
        finalContent.options = data.content.options.map(
          (opt: any, idx: number) => ({
            ...opt,
            id: String.fromCharCode(65 + idx),
          })
        );
        finalContent.correctOptionId = data.content.correctOptionId;
      } else if (data.type === ExerciseType.MATCHING) {
        finalContent.pairs = data.content.pairs;
      } else if (data.type === ExerciseType.FILL_BLANKS) {
        finalContent.text = data.content.text;
        finalContent.wordBank = data.content.wordBank;
        finalContent.correctAnswers = data.content.correctAnswers;
      }

      const payload = { ...data, content: finalContent };

      if (isEdit) {
        await updateExercise(id, payload);
        toast.success("Đã cập nhật bài tập");
      } else {
        await createExercise(payload);
        toast.success("Đã tạo bài tập mới");
      }
      navigate("/admin/exercises");
    } catch (err) {
      toast.error("Lỗi khi lưu bài tập");
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin text-red-600">
          <LayersIcon size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/exercises")}
                className="p-2 -ml-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
              >
                <ArrowLeftIcon size={20} />
              </button>
              <h1 className="text-xl font-bold text-slate-800">
                {isEdit ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
              </h1>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
            >
              <SaveIcon size={18} />
              Lưu bài tập
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* General Info */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                    <TypeIcon size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Thông tin chung
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Tên bài tập
                    </label>
                    <input
                      {...register("title", { required: "Vui lòng nhập tên" })}
                      className={`w-full px-4 py-3 bg-slate-50 border ${
                        errors.title ? "border-red-300" : "border-slate-200"
                      } rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all font-medium`}
                      placeholder="Nhập tiêu đề hấp dẫn cho bài tập..."
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1 font-bold">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Mô tả
                    </label>
                    <textarea
                      {...register("description")}
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all font-medium"
                      placeholder="Mô tả ngắn gọn về mục tiêu bài tập này..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Dạng bài tập
                    </label>
                    <FormSelect
                      value={selectedType}
                      onChange={(val) => {
                        setValue("type", val as ExerciseType);
                      }}
                      options={[
                        {
                          value: ExerciseType.MULTIPLE_CHOICE,
                          label: "Trắc nghiệm ABCD",
                        },
                        { value: ExerciseType.MATCHING, label: "Nối cặp" },
                        {
                          value: ExerciseType.FILL_BLANKS,
                          label: "Điền vào chỗ trống",
                        },
                      ]}
                      className="w-full h-12 bg-slate-50 border-slate-200 rounded-2xl font-bold"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Độ khó
                      </label>
                      <FormSelect
                        value={watch("difficulty")}
                        onChange={(val) => setValue("difficulty", val as any)}
                        options={[
                          { value: "easy", label: "Dễ" },
                          { value: "medium", label: "Trung bình" },
                          { value: "hard", label: "Khó" },
                        ]}
                        className="w-full h-12 bg-slate-50 border-slate-200 rounded-2xl font-bold uppercase tracking-tighter"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Điểm
                      </label>
                      <input
                        type="number"
                        {...register("points")}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-100 font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Question Content */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <HelpCircleIcon size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Nội dung câu hỏi
                  </h2>
                </div>

                {selectedType === ExerciseType.MULTIPLE_CHOICE && (
                  <MultipleChoiceForm />
                )}
                {selectedType === ExerciseType.MATCHING && <MatchingForm />}
                {selectedType === ExerciseType.FILL_BLANKS && (
                  <FillBlanksForm />
                )}
              </section>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ExerciseForm;
