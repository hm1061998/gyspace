import React from "react";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { Exercise } from "@/types";

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  userAnswers: any;
  setUserAnswers: React.Dispatch<React.SetStateAction<any>>;
  submitted: boolean;
}

const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  exercise,
  userAnswers,
  setUserAnswers,
  submitted,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-xl font-medium text-slate-700 bg-slate-50 p-8 rounded-[30px] border border-slate-100 font-hanzi text-center shadow-inner">
        {exercise.content.question}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {exercise.content.options.map((opt: any) => {
          const isSelected = userAnswers.selectedOptionId === opt.id;
          const isCorrect =
            submitted && opt.id === exercise.content.correctOptionId;
          const isWrong = submitted && isSelected && !isCorrect;

          return (
            <button
              key={opt.id}
              disabled={submitted}
              onClick={() => setUserAnswers({ selectedOptionId: opt.id })}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group relative overflow-hidden
                ${
                  isSelected
                    ? submitted
                      ? isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-300 transform scale-[1.02]"
                    : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                }
                
                ${
                  submitted &&
                  !isSelected &&
                  opt.id === exercise.content.correctOptionId
                    ? "border-green-500 bg-green-50 border-dashed !opacity-100"
                    : ""
                }
              `}
            >
              <div className="flex items-center gap-4 relative z-10">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black
                     ${
                       isSelected && !submitted
                         ? "bg-white/20 text-white"
                         : "bg-slate-100 text-slate-400"
                     }
                     ${isCorrect ? "!bg-green-500 text-white" : ""}
                     ${isWrong ? "!bg-red-500 text-white" : ""}
                  `}
                >
                  {opt.id}
                </span>
                <span className="font-bold text-lg">{opt.text}</span>
              </div>

              {isCorrect && (
                <CheckCircle2Icon className="text-green-600 relative z-10" />
              )}
              {isWrong && (
                <XCircleIcon className="text-red-500 relative z-10" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceExercise;
