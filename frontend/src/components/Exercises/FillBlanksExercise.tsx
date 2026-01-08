import React from "react";
import { XCircleIcon, LightbulbIcon } from "lucide-react";
import { Exercise } from "@/types";

interface FillBlanksExerciseProps {
  exercise: Exercise;
  userAnswers: any;
  setUserAnswers: React.Dispatch<React.SetStateAction<any>>;
  activeBlankIndex: number | null;
  setActiveBlankIndex: React.Dispatch<React.SetStateAction<number | null>>;
  submitted: boolean;
}

const FillBlanksExercise: React.FC<FillBlanksExerciseProps> = ({
  exercise,
  userAnswers,
  setUserAnswers,
  activeBlankIndex,
  setActiveBlankIndex,
  submitted,
}) => {
  // Shuffle word bank only once when exercise changes
  const shuffledWordBank = React.useMemo(() => {
    const bank = [...(exercise.content.wordBank || [])];
    return bank.sort(() => Math.random() - 0.5);
  }, [exercise.id || exercise.content.text]); // Re-shuffle if it's a new exercise

  // Extract blank indices from text ensuring we respect the actual IDs (e.g., [1], [2])
  const blankIndices = React.useMemo(() => {
    const matches = exercise.content.text.match(/\[(\d+)\]/g);
    if (!matches) return [];
    return matches.map((m) => parseInt(m.match(/\d+/)?.[0] || "0"));
  }, [exercise.content.text]);

  const handleWordBankClick = (word: string) => {
    if (submitted) return;

    if (activeBlankIndex !== null) {
      setUserAnswers((prev: any) => ({
        ...prev,
        [`blank_${activeBlankIndex}`]: word,
      }));
      // Auto move to next empty blank
      const nextEmpty = blankIndices.find(
        (i) => i > activeBlankIndex && !userAnswers[`blank_${i}`]
      );
      if (nextEmpty !== undefined) {
        setActiveBlankIndex(nextEmpty);
      } else {
        setActiveBlankIndex(null);
      }
    } else {
      // Find first empty blank
      const firstEmpty = blankIndices.find((i) => !userAnswers[`blank_${i}`]);
      if (firstEmpty !== undefined) {
        setUserAnswers((prev: any) => ({
          ...prev,
          [`blank_${firstEmpty}`]: word,
        }));
        const next = blankIndices.find(
          (i) => i > firstEmpty && !userAnswers[`blank_${i}`]
        );
        if (next !== undefined) setActiveBlankIndex(next);
      }
    }
  };

  // Get correct answer for a position
  const getCorrectAnswer = (position: number): string => {
    const correctAnswer = exercise.content.correctAnswers?.find(
      (ans: any) => ans.position === position
    );
    return correctAnswer?.word || "";
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-slate-50 p-8 sm:p-10 rounded-[30px] border border-slate-200 shadow-inner font-hanzi text-xl sm:text-2xl leading-loose text-slate-800 text-justify">
        {exercise.content.text
          .split(/(\[\d+\])/)
          .map((part: string, idx: number) => {
            const match = part.match(/\[(\d+)\]/);
            if (match) {
              const blankIdx = parseInt(match[1]);
              const userVal = userAnswers[`blank_${blankIdx}`];
              const correctVal = getCorrectAnswer(blankIdx);
              const isActive = activeBlankIndex === blankIdx;

              const isCorrect =
                submitted &&
                userVal?.trim().toLowerCase() === correctVal.toLowerCase();
              const isWrong = submitted && !isCorrect;

              return (
                <span key={idx} className="relative inline-block mx-1">
                  <button
                    disabled={submitted}
                    onClick={() => {
                      setActiveBlankIndex(blankIdx);
                    }}
                    className={`
                      min-w-[80px] h-10 px-3 pb-1 border-b-[3px] transition-all font-bold text-lg align-baseline
                      ${
                        isActive
                          ? "border-slate-900 bg-white -translate-y-1 shadow-lg shadow-slate-200"
                          : "border-slate-300 bg-slate-200/50 hover:bg-white hover:border-slate-400"
                      }
                      ${userVal ? "text-slate-900" : "text-transparent"}
                      ${
                        isCorrect
                          ? "!border-green-500 !bg-green-100 !text-green-800"
                          : ""
                      }
                      ${
                        isWrong
                          ? "!border-red-500 !bg-red-50 !text-red-800"
                          : ""
                      }
                   `}
                  >
                    {userVal || "____"}
                  </button>

                  {isActive && userVal && !submitted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserAnswers((prev: any) => ({
                          ...prev,
                          [`blank_${blankIdx}`]: undefined,
                        }));
                      }}
                      className="absolute -top-3 -right-3 bg-slate-200 hover:bg-slate-300 rounded-full p-1 text-slate-600 z-10"
                    >
                      <XCircleIcon size={14} />
                    </button>
                  )}

                  {isWrong && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-green-600 text-white text-xs rounded-lg font-bold shadow-lg animate-bounce z-20">
                      {correctVal}
                      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-green-600"></div>
                    </div>
                  )}
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
      </div>

      {!submitted && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-100/50">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <LightbulbIcon size={14} />
            Ngân hàng từ vựng
          </p>
          <div className="flex flex-wrap gap-2">
            {shuffledWordBank.map((word: string, wIdx: number) => {
              const isUsed = Object.values(userAnswers).includes(word);
              const isSelected =
                activeBlankIndex !== null &&
                userAnswers[`blank_${activeBlankIndex}`] === word;

              return (
                <button
                  key={wIdx}
                  onClick={() => handleWordBankClick(word)}
                  className={`
                    px-4 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-sm border
                    ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 ring-4 ring-slate-200"
                        : isUsed
                        ? "bg-slate-100 text-slate-400 border-slate-200"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }
                  `}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FillBlanksExercise;
