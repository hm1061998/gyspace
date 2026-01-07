import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { PlusIcon, Trash2Icon, ArrowLeftIcon } from "lucide-react";
import { Exercise } from "@/types";

const MatchingForm: React.FC = () => {
  const { register, control } = useFormContext<Partial<Exercise>>();
  const {
    fields: pairFields,
    append: appendPair,
    remove: removePair,
  } = useFieldArray({
    control,
    name: "content.pairs" as any,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Danh sách cặp nối
        </label>
        <button
          type="button"
          onClick={() => appendPair({ left: "", right: "" })}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <PlusIcon size={14} /> Thêm cặp mới
        </button>
      </div>

      {pairFields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-center animate-pop">
          <div className="flex-1">
            <input
              {...register(`content.pairs.${index}.left` as any)}
              placeholder="Vế trái (Vd: Hanzi)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50 font-medium"
            />
          </div>
          <div className="text-slate-300">
            <ArrowLeftIcon className="rotate-180" size={16} />
          </div>
          <div className="flex-1">
            <input
              {...register(`content.pairs.${index}.right` as any)}
              placeholder="Vế phải (Vd: Nghĩa)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50 font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => removePair(index)}
            className="p-3 text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2Icon size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default MatchingForm;
