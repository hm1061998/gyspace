import React, { useMemo, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckCircle2, Type } from "lucide-react";
import { MagicIcon } from "@/components/common/icons";

const FillBlanksForm: React.FC = () => {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext();
  const [distractorsText, setDistractorsText] = useState("");

  const text = useWatch({ control, name: "content.text" }) || "";
  const correctAnswers =
    (useWatch({ control, name: "content.correctAnswers" }) as any[]) || [];
  const wordBank =
    (useWatch({ control, name: "content.wordBank" }) as string[]) || [];

  // Initialize distractors text once when form loads (Edit mode)
  useEffect(() => {
    // Only init if we have a wordbank but no local distractors state yet
    if (wordBank.length > 0 && distractorsText === "") {
      const correctWords = correctAnswers.map((a: any) => a.word?.trim());
      const initialDistractors = wordBank.filter(
        (w) => !correctWords.includes(w.trim())
      );
      if (initialDistractors.length > 0) {
        setDistractorsText(initialDistractors.join(", "));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordBank.length, correctAnswers.length]); // Depend on lengths to trigger check on load

  const detectedBlanks = useMemo(() => {
    const matches = text.match(/\[(\d+)\]/g);
    if (!matches) return [];

    const positions = matches.map((m: string) => parseInt(m.match(/\d+/)![0]));
    return Array.from(new Set<number>(positions)).sort((a, b) => a - b);
  }, [text]);

  // Auto-sync correctAnswers when blanks change
  useEffect(() => {
    // If no blanks, clear answers
    if (detectedBlanks.length === 0) {
      if (correctAnswers.length > 0) {
        setValue("content.correctAnswers", []);
        // Optional: clear wordbank too? Maybe not.
      }
      return;
    }

    // Map detected blanks to answer objects
    // Preserve existing answers if position matches
    const newAnswers = detectedBlanks.map((pos) => {
      const existing = correctAnswers.find((ans: any) => ans.position === pos);
      return {
        position: pos,
        word: existing?.word?.trim() || "",
      };
    });

    const structureChanged =
      newAnswers.length !== correctAnswers.length ||
      newAnswers.some(
        (ans, idx) => ans.position !== correctAnswers[idx]?.position
      );

    if (structureChanged) {
      setValue("content.correctAnswers", newAnswers);
    }
  }, [detectedBlanks, setValue, correctAnswers]);

  // Sync Word Bank: Combine current correctWords + distractorsText
  useEffect(() => {
    const correctWords = correctAnswers
      .map((a: any) => a.word?.trim())
      .filter(Boolean);

    const distractors = distractorsText
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    // Merge correct answers and distractors for the official Word Bank
    const newWordBank = Array.from(new Set([...correctWords, ...distractors]));

    // Only update if changed
    // JSON stringify comparison is safe for small arrays of strings
    if (JSON.stringify(newWordBank) !== JSON.stringify(wordBank)) {
      setValue("content.wordBank", newWordBank);
    }
  }, [correctAnswers, distractorsText, setValue, wordBank]);

  return (
    <div className="space-y-4">
      {/* Step 1: Text with blanks */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm border border-blue-100 shrink-0 mt-1">
            1
          </div>
          <div className="flex-1">
            <label className="block text-base font-bold text-slate-900 mb-1">
              Nội dung câu hỏi
            </label>
            <p className="text-sm text-slate-500 mb-4">
              Nhập đoạn văn và sử dụng ký hiệu{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 text-xs font-mono font-bold">
                [0]
              </code>
              ,{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 text-xs font-mono font-bold">
                [1]
              </code>
              ... để đánh dấu vị trí cần điền từ.
            </p>
            <div className="relative">
              <textarea
                {...register("content.text", {
                  required: "Vui lòng nhập văn bản",
                })}
                rows={5}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-base leading-relaxed resize-y ${
                  (errors as any)?.content?.text
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
                placeholder="Ví dụ: Hello world. This is a [0] example for [1]."
              />
              {(errors as any)?.content?.text && (
                <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                  {(errors as any)?.content?.text?.message}
                </p>
              )}
            </div>

            {detectedBlanks.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
                <CheckCircle2 size={16} />
                <span className="font-medium">
                  Đã nhận diện{" "}
                  <span className="font-bold">{detectedBlanks.length}</span> chỗ
                  trống:{" "}
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-blue-100 mx-1">
                    {detectedBlanks.map((b) => `[${b}]`).join(", ")}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Fill in correct answers */}
      {detectedBlanks.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
            <Type size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">
            Vui lòng nhập nội dung câu hỏi ở trên để tiếp tục
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold text-sm border border-green-100 shrink-0 mt-1">
              2
            </div>
            <div className="flex-1">
              <label className="block text-base font-bold text-slate-900 mb-1">
                Đáp án đúng
              </label>
              <p className="text-sm text-slate-500">
                Nhập từ chính xác cho từng chỗ trống tương ứng.
              </p>
            </div>
          </div>

          <div className="pl-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            {correctAnswers.map((answer: any, idx: number) => (
              <div
                key={answer.position}
                className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 group focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-100 transition-all"
              >
                <div className="w-8 h-8 bg-white text-slate-500 rounded-lg flex items-center justify-center font-bold text-xs border border-slate-200 shadow-sm shrink-0">
                  [{answer.position}]
                </div>
                <div className="flex-1">
                  <input
                    {...register(`content.correctAnswers.${idx}.word`, {
                      required: "Nhập đáp án",
                    })}
                    placeholder="Nhập đáp án..."
                    className={`w-full bg-transparent border-none p-0 focus:ring-0 font-medium placeholder:text-slate-400 ${
                      (errors as any)?.content?.correctAnswers?.[idx]?.word
                        ? "text-red-900 placeholder:text-red-300"
                        : "text-slate-900"
                    }`}
                  />
                  {(errors as any)?.content?.correctAnswers?.[idx]?.word && (
                    <p className="text-red-500 text-[10px] font-bold mt-1">
                      {
                        (errors as any)?.content?.correctAnswers?.[idx]?.word
                          ?.message
                      }
                    </p>
                  )}
                  <input
                    type="hidden"
                    {...register(`content.correctAnswers.${idx}.position`)}
                    value={answer.position}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Add distractor words */}
      {detectedBlanks.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-8 duration-700 delay-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm border border-orange-100 shrink-0 mt-1">
              3
            </div>
            <div className="flex-1">
              <label className="block text-base font-bold text-slate-900 mb-1">
                Từ gây nhiễu (Tùy chọn)
              </label>
              <p className="text-sm text-slate-500">
                Nhập các từ sai để tăng độ khó (phân cách bằng dấu phẩy).
              </p>
            </div>
          </div>

          <div className="pl-12">
            <textarea
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium text-slate-900 resize-none"
              placeholder="VD: incorrect, wrong, false"
              value={distractorsText}
              onChange={(e) => setDistractorsText(e.target.value)}
            />

            {/* Preview word bank */}
            {wordBank.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MagicIcon className="w-3 h-3" />
                  Xem trước ngân hàng từ
                </p>
                <div className="flex flex-wrap gap-2">
                  {wordBank.map((word: string, idx: number) => {
                    const correctWordsList = correctAnswers
                      .map((a: any) => a.word.trim())
                      .filter((w: string) => w && w.trim());
                    const isCorrect = correctWordsList.includes(word.trim());
                    return (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all select-none ${
                          isCorrect
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {isCorrect && (
                          <span className="mr-1.5 font-bold text-green-600">
                            ✓
                          </span>
                        )}
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FillBlanksForm;
