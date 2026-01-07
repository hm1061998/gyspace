import React from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2Icon } from "lucide-react";
import { Exercise } from "@/types";

const MultipleChoiceForm: React.FC = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<Partial<Exercise>>();

  const options = watch("content.options") || [];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
          Câu hỏi trắc nghiệm
        </label>
        <textarea
          {...register("content.question" as any, {
            required: "Vui lòng nhập câu hỏi",
          })}
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all font-medium"
          placeholder="Ví dụ: Đâu là nghĩa của từ 'Thất bát'?"
        />
        {errors.content && (errors.content as any).question && (
          <p className="text-red-500 text-xs mt-1 font-bold">
            {(errors.content as any).question.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((_: any, index: number) => {
          const label = String.fromCharCode(65 + index); // A, B, C, D
          const isCorrect = watch("content.correctOptionId") === label;

          return (
            <div key={index} className="relative group">
              <div className="absolute top-3.5 left-4 font-black text-slate-300 text-xs">
                {label}
              </div>
              <input
                {...register(`content.options.${index}.text` as any, {
                  required: "Nhập nội dung",
                })}
                className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 border ${
                  isCorrect
                    ? "border-green-400 ring-2 ring-green-50"
                    : "border-slate-200"
                } rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 font-medium`}
                placeholder={`Lựa chọn ${label}...`}
              />
              <button
                type="button"
                onClick={() =>
                  setValue("content.correctOptionId" as any, label)
                }
                className={`absolute top-2.5 right-2 p-1.5 rounded-lg transition-all ${
                  isCorrect
                    ? "bg-green-500 text-white"
                    : "text-slate-300 hover:text-slate-400 bg-slate-100"
                }`}
              >
                <CheckCircle2Icon size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceForm;
