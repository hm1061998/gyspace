import React, { useMemo, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckCircle2Icon, TypeIcon } from "lucide-react";
import { Exercise, ExerciseType } from "@/types";

const FillBlanksForm: React.FC = () => {
  const { register, control, setValue } = useFormContext<Partial<Exercise>>();
  const [distractorsText, setDistractorsText] = React.useState("");

  const text = useWatch({ control, name: "content.text" }) || "";
  const correctAnswers =
    (useWatch({ control, name: "content.correctAnswers" }) as any[]) || [];
  const wordBank =
    (useWatch({ control, name: "content.wordBank" }) as string[]) || [];
  const selectedType = useWatch({ control, name: "type" });

  // Initialize distractors text once when form loads (Edit mode)
  React.useEffect(() => {
    if (wordBank.length > 0 && distractorsText === "") {
      const correctWords = correctAnswers.map((a: any) => a.word.trim());
      const initialDistractors = wordBank.filter(
        (w) => !correctWords.includes(w.trim())
      );
      if (initialDistractors.length > 0) {
        setDistractorsText(initialDistractors.join(", "));
      }
    }
  }, [wordBank.length === 0]); // Run once when wordBank becomes available

  const detectedBlanks = useMemo(() => {
    if (selectedType !== ExerciseType.FILL_BLANKS) return [];
    const matches = text.match(/\[(\d+)\]/g);
    if (!matches) return [];

    const positions = matches.map((m) => parseInt(m.match(/\d+/)![0]));
    return Array.from(new Set<number>(positions)).sort((a, b) => a - b);
  }, [selectedType, text]);

  // Auto-sync correctAnswers when blanks change
  useEffect(() => {
    if (selectedType !== ExerciseType.FILL_BLANKS) return;

    if (detectedBlanks.length === 0) {
      if (correctAnswers.length > 0) {
        setValue("content.correctAnswers" as any, []);
        setValue("content.wordBank" as any, []);
      }
      return;
    }

    const newAnswers = detectedBlanks.map((pos) => {
      const existing = correctAnswers.find((ans: any) => ans.position === pos);
      return {
        position: pos,
        word: existing?.word || "",
      };
    });

    const structureChanged =
      newAnswers.length !== correctAnswers.length ||
      newAnswers.some(
        (ans, idx) => ans.position !== correctAnswers[idx]?.position
      );

    if (structureChanged) {
      setValue("content.correctAnswers" as any, newAnswers);
    }
  }, [selectedType, detectedBlanks, setValue]);

  // Sync Word Bank: Combine current correctWords + distractorsText
  useEffect(() => {
    if (selectedType !== ExerciseType.FILL_BLANKS) return;

    const correctWords = correctAnswers
      .map((a: any) => a.word.trim())
      .filter(Boolean);

    const distractors = distractorsText
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    const newWordBank = Array.from(new Set([...correctWords, ...distractors]));

    // Only update if changed
    if (JSON.stringify(newWordBank) !== JSON.stringify(wordBank)) {
      setValue("content.wordBank" as any, newWordBank);
    }
  }, [selectedType, correctAnswers, distractorsText, setValue]);

  return (
    <div className="space-y-6">
      {/* Step 1: Text with blanks */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
            1
          </div>
          <div>
            <label className="block text-sm font-black text-blue-900">
              Nhập câu văn có chỗ trống
            </label>
            <p className="text-xs text-blue-600">
              Dùng [0], [1], [2]... để đánh dấu chỗ trống
            </p>
          </div>
        </div>
        <textarea
          {...register("content.text" as any, {
            required: "Vui lòng nhập văn bản",
          })}
          rows={4}
          className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all font-medium text-lg"
          placeholder="VD: Anh ấy rất [0] nên được mọi người [1]."
        />
        {detectedBlanks.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
            <CheckCircle2Icon size={14} />
            <span className="font-bold">
              Đã phát hiện {detectedBlanks.length} chỗ trống: [
              {detectedBlanks.join("], [")}]
            </span>
          </div>
        )}
      </div>

      {/* Step 2: Fill in correct answers */}
      {detectedBlanks.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <TypeIcon size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-400 font-medium">
            Nhập văn bản ở trên để bắt đầu
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
              2
            </div>
            <div>
              <label className="block text-sm font-black text-green-900">
                Nhập đáp án đúng cho từng chỗ trống
              </label>
              <p className="text-xs text-green-600">
                Hệ thống đã tự động tạo {detectedBlanks.length} ô nhập liệu
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {correctAnswers.map((answer: any, idx: number) => (
              <div
                key={answer.position}
                className="flex items-center gap-3 bg-white p-4 rounded-2xl border-2 border-green-300 shadow-sm"
              >
                <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center font-black flex-shrink-0">
                  [{answer.position}]
                </div>
                <div className="flex-1">
                  <input
                    {...register(`content.correctAnswers.${idx}.word` as any, {
                      required: "Nhập đáp án",
                    })}
                    placeholder="Nhập từ/cụm từ đúng..."
                    className="w-full px-4 py-3 bg-green-50 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 font-bold text-base text-green-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Add distractor words (optional) */}
      {detectedBlanks.length > 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
              3
            </div>
            <div>
              <label className="block text-sm font-black text-orange-900">
                Thêm từ gây nhiễu (Tùy chọn)
              </label>
              <p className="text-xs text-orange-600">
                Nhập các từ sai để làm khó người học, cách nhau bởi dấu phẩy
              </p>
            </div>
          </div>
          <textarea
            rows={2}
            className="w-full px-4 py-3 bg-white border-2 border-orange-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium"
            placeholder="VD: ngu ngốc, xấu xa, ghét bỏ"
            value={distractorsText}
            onChange={(e) => setDistractorsText(e.target.value)}
          />

          {/* Preview word bank */}
          {wordBank.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-orange-200">
              <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3">
                📚 Ngân hàng từ (Preview)
              </p>
              <div className="flex flex-wrap gap-2">
                {wordBank.map((word: string, idx: number) => {
                  const correctWords = correctAnswers
                    .map((a: any) => a.word)
                    .filter((w: string) => w && w.trim());
                  const isCorrect = correctWords.includes(word);
                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${
                        isCorrect
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-orange-100 text-orange-700 border-orange-300"
                      }`}
                    >
                      {isCorrect && "✓ "}
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FillBlanksForm;
