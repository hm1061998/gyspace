import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import { TrashIcon, PlusIcon } from "@/components/common/icons";

const MultipleChoiceForm: React.FC = () => {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.options",
  });
  const correctOptionId = watch("content.correctOptionId");

  return (
    <div className="space-y-4">
      <div>
        <Textarea
          label="Câu hỏi"
          rows={3}
          placeholder="Nhập nội dung câu hỏi..."
          {...register("content.question", {
            required: "Vui lòng nhập câu hỏi",
          })}
          error={(errors as any)?.content?.question?.message}
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
          Các phương án trả lời
          <span className="text-xs font-normal text-slate-500 ml-2 italic">
            (Chọn nút tròn để đánh dấu đáp án đúng)
          </span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {fields.map((field, index) => {
            // We use index to determine A, B, C, D strictly
            const optionId = String.fromCharCode(65 + index);
            const isCorrect = correctOptionId === optionId;
            const optionError = (errors as any)?.content?.options?.[index]?.text
              ?.message;

            return (
              <div
                key={field.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCorrect
                    ? "bg-blue-50 border-blue-200"
                    : "bg-slate-50 border-slate-100 hover:border-slate-300"
                }`}
              >
                <div
                  title="Chọn làm đáp án đúng"
                  className="flex items-center justify-center cursor-pointer p-1"
                  onClick={() =>
                    setValue("content.correctOptionId", optionId, {
                      shouldDirty: true,
                    })
                  }
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isCorrect ? "border-blue-600" : "border-slate-300"
                    }`}
                  >
                    {isCorrect && (
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </div>

                <span
                  className={`font-bold w-6 ${
                    isCorrect ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  {optionId}.
                </span>

                <div className="flex-1">
                  <Input
                    className="bg-white"
                    placeholder={`Nhập nội dung phương án ${optionId}...`}
                    {...register(`content.options.${index}.text` as const, {
                      required: "Nội dung phương án không được để trống",
                    })}
                    error={optionError}
                  />
                  <input
                    type="hidden"
                    {...register(`content.options.${index}.id` as const)}
                    value={optionId}
                  />
                </div>

                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      // If deleting the correct option, reset correct option to A
                      if (isCorrect) {
                        setValue("content.correctOptionId", "A");
                      }
                      // If deleting an option BEFORE the correct option, the correct option index shifts down
                      // e.g. Correct is C (index 2). We delete B (index 1). New Correct should be new B (old C).
                      // But since we use IDs "A", "B", storing ID is tricky if IDs are dynamic.
                      // Actually, we are storing "A", "B", "C".
                      // If Correct is "C" and we delete "B". The old "C" becomes the new "B".
                      // So the "value" of the correct option needs to shift.

                      // However, simpler logic: verify correctness after render.
                      // The simplest UX: If I delete the correct answer, select the first one.
                      // If I delete a wrong answer, keep the correct answer *conceptually*?
                      // If I chose "C" (3rd item) and delete "B" (2nd item), the 3rd item becomes 2nd ("B").
                      // So we should probably check indices.

                      const currentCorrectIndex =
                        correctOptionId.charCodeAt(0) - 65;
                      if (currentCorrectIndex === index) {
                        setValue("content.correctOptionId", "A");
                      } else if (currentCorrectIndex > index) {
                        // Shift correct ID down by one char (e.g. C -> B)
                        setValue(
                          "content.correctOptionId",
                          String.fromCharCode(65 + currentCorrectIndex - 1)
                        );
                      }

                      remove(index);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa phương án này"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}

          {fields.length < 10 && (
            <button
              type="button"
              onClick={() => append({ id: "", text: "" })}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all group"
            >
              <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Thêm phương án
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultipleChoiceForm;
