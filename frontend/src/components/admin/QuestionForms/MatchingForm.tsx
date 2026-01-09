import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import Input from "@/components/common/Input";
import { PlusIcon, TrashIcon } from "@/components/common/icons";

const MatchingForm: React.FC = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.pairs",
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 italic mb-2 ml-1">
        Nhập các cặp từ tương ứng (Trái - Phải)
      </p>
      {fields.map((field, index) => {
        const leftError = (errors as any)?.content?.pairs?.[index]?.left
          ?.message;
        const rightError = (errors as any)?.content?.pairs?.[index]?.right
          ?.message;

        return (
          <div key={field.id} className="flex gap-2 items-center">
            <div className="flex-1">
              <Input
                placeholder="Vế trái"
                {...register(`content.pairs.${index}.left` as const, {
                  required: "Nhập vế trái",
                })}
                error={leftError}
              />
            </div>
            <span className="text-slate-400 self-center pb-5">-</span>
            <div className="flex-1">
              <Input
                placeholder="Vế phải"
                {...register(`content.pairs.${index}.right` as const, {
                  required: "Nhập vế phải",
                })}
                error={rightError}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => append({ left: "", right: "" })}
        className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors ml-1"
      >
        <PlusIcon className="w-4 h-4" /> Thêm cặp
      </button>
    </div>
  );
};

export default MatchingForm;
