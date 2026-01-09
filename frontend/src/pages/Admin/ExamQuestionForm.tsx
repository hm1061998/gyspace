import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider, Controller, useWatch } from "react-hook-form";
import { ArrowLeftIcon, SaveIcon } from "@/components/common/icons";
import { examQuestionService, examPaperService } from "@/services/api";
import { toast } from "@/libs/Toast";
import { loadingService } from "@/libs/Loading";
import FormSelect from "@/components/common/FormSelect";
import Input from "@/components/common/Input";

// Import new modular form components
import MultipleChoiceForm from "@/components/admin/QuestionForms/MultipleChoiceForm";
import MatchingForm from "@/components/admin/QuestionForms/MatchingForm";
import FillBlanksForm from "@/components/admin/QuestionForms/FillBlanksForm";

interface ExamQuestionFormData {
  type: "MATCHING" | "MULTIPLE_CHOICE" | "FILL_BLANKS";
  points: number;
  content: any;
}

const ExamQuestionForm: React.FC = () => {
  const { id, questionId } = useParams<{ id: string; questionId?: string }>();
  const navigate = useNavigate();
  const isEdit = !!questionId;
  const [paperTitle, setPaperTitle] = useState("");

  const methods = useForm<ExamQuestionFormData>({
    defaultValues: {
      type: "MULTIPLE_CHOICE",
      points: 10,
      content: {
        question: "", // Default for Multiple Choice
        options: [
          { id: "A", text: "" },
          { id: "B", text: "" },
          { id: "C", text: "" },
          { id: "D", text: "" },
        ],
        correctOptionId: "A",
      },
    },
  });

  const { control, handleSubmit, reset, watch, setValue } = methods;
  const type = watch("type");

  // Fetch Paper info just for title
  useEffect(() => {
    if (id) {
      examPaperService
        .getOne(id)
        .then((res: any) => setPaperTitle(res.title))
        .catch(() => {});
    }
  }, [id]);

  // Fetch Question if Edit
  useEffect(() => {
    if (isEdit && questionId) {
      loadingService.show("Tải câu hỏi...");
      examQuestionService
        .getOne(questionId)
        .then((res: any) => {
          reset({
            type: res.type,
            points: res.points,
            content: res.content,
          });
        })
        .catch(() => {
          toast.error("Không thể tải câu hỏi");
          navigate(`/admin/exams/${id}`);
        })
        .finally(() => loadingService.hide());
    }
  }, [isEdit, questionId, reset, navigate, id]);

  // Handle Type Change
  const getDefaultContent = (selectedType: string) => {
    if (selectedType === "MULTIPLE_CHOICE") {
      return {
        question: "",
        options: [
          { id: "A", text: "" },
          { id: "B", text: "" },
          { id: "C", text: "" },
          { id: "D", text: "" },
        ],
        correctOptionId: "A",
      };
    } else if (selectedType === "MATCHING") {
      return {
        pairs: [
          { left: "", right: "" },
          { left: "", right: "" },
        ],
      };
    } else if (selectedType === "FILL_BLANKS") {
      return {
        text: "",
        wordBank: [],
        correctAnswers: [],
      };
    }
    return {};
  };

  const onTypeChange = (newType: any) => {
    setValue("type", newType);
    setValue("content", getDefaultContent(newType));
  };

  const onSubmit = async (data: ExamQuestionFormData) => {
    try {
      loadingService.show("Đang lưu...");

      // Validation
      if (data.type === "MULTIPLE_CHOICE") {
        const { options, correctOptionId, question } = data.content;
        if (!question?.trim()) {
          toast.error("Vui lòng nhập câu hỏi");
          loadingService.hide();
          return;
        }
        if (!options || options.length < 2) {
          toast.error("Cần ít nhất 2 phương án trả lời");
          loadingService.hide();
          return;
        }
        if (!correctOptionId) {
          toast.error("Vui lòng chọn đáp án đúng");
          loadingService.hide();
          return;
        }
        if (options.some((o: any) => !o.text?.trim())) {
          toast.error("Vui lòng nhập đầy đủ nội dung các phương án");
          loadingService.hide();
          return;
        }
      } else if (data.type === "MATCHING") {
        const { pairs } = data.content;
        if (!pairs || pairs.length === 0) {
          toast.error("Cần ít nhất 1 cặp từ để nối");
          loadingService.hide();
          return;
        }
        if (pairs.some((p: any) => !p.left?.trim() || !p.right?.trim())) {
          toast.error("Vui lòng nhập đầy đủ nội dung cho các cặp từ");
          loadingService.hide();
          return;
        }
      } else if (data.type === "FILL_BLANKS") {
        const { text, correctAnswers } = data.content;
        if (!text?.trim()) {
          toast.error("Vui lòng nhập văn bản câu hỏi");
          loadingService.hide();
          return;
        }
        // Check for placeholders
        const placeholders = text.match(/\[\d+\]/g);
        if (!placeholders || placeholders.length === 0) {
          toast.error(
            "Văn bản cần chứa ít nhất một chỗ trống dạng [0], [1]..."
          );
          loadingService.hide();
          return;
        }
        if (!correctAnswers || correctAnswers.length !== placeholders.length) {
          toast.error(
            "Số lượng đáp án không khớp với số chỗ trống. Hãy nhấn nút 'Cập nhật' hoặc kiểm tra lại."
          );
          loadingService.hide();
          return;
        }
        if (correctAnswers.some((a: any) => !a.word?.trim())) {
          toast.error("Vui lòng nhập đáp án cho tất cả các chỗ trống");
          loadingService.hide();
          return;
        }
      }

      const payload = {
        examPaperId: id,
        ...data,
      };

      if (isEdit && questionId) {
        await examQuestionService.update(questionId, payload);
        toast.success("Đã cập nhật câu hỏi");
      } else {
        await examQuestionService.create(payload);
        toast.success("Đã tạo câu hỏi mới");
      }
      navigate(`/admin/exams/${id}`);
    } catch (error) {
      toast.error("Lỗi khi lưu câu hỏi");
      console.error(error);
    } finally {
      loadingService.hide();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 relative">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full overflow-hidden"
        >
          {/* Fixed Header */}
          <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-10 transition-all">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/exams/${id}`)}
                  className="p-2 -ml-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                  title="Quay lại"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                    {isEdit ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
                  </h1>
                  <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
                    {paperTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Loại câu hỏi
                    </label>
                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <FormSelect
                          options={[
                            {
                              value: "MULTIPLE_CHOICE",
                              label: "Trắc nghiệm (ABCD)",
                            },
                            { value: "MATCHING", label: "Nối từ" },
                            { value: "FILL_BLANKS", label: "Điền từ" },
                          ]}
                          value={field.value}
                          onChange={(val) => onTypeChange(val)}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Controller
                      control={control}
                      name="points"
                      render={({ field }) => (
                        <Input
                          type="number"
                          label="Điểm"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  {type === "MULTIPLE_CHOICE" && <MultipleChoiceForm />}
                  {type === "MATCHING" && <MatchingForm />}
                  {type === "FILL_BLANKS" && <FillBlanksForm />}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex-none bg-white border-t border-slate-200 py-4 px-6 z-20 shadow-[0_-4px_6_rgba(0,0,0,0.05)]">
            <div className="max-w-6xl mx-auto w-full flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(`/admin/exams/${id}`)}
                className="px-6 py-2.5 bg-white text-slate-500 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white font-black rounded-xl hover:bg-red-600 shadow-lg shadow-slate-900/10 hover:shadow-red-200 active:scale-95 transition-all"
              >
                <SaveIcon className="w-5 h-5" />
                Lưu câu hỏi
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ExamQuestionForm;
