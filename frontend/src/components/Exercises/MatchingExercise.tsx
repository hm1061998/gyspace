import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { Exercise } from "@/types";
import { toast } from "@/libs/Toast";

interface MatchingExerciseProps {
  exercise: Exercise;
  matches: Record<number, number>;
  setMatches: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  selectedLeft: number | null;
  setSelectedLeft: React.Dispatch<React.SetStateAction<number | null>>;
  submitted: boolean;
}

const PAIR_COLORS = [
  "bg-orange-100 border-orange-200 text-orange-900 shadow-orange-100",
  "bg-blue-100 border-blue-200 text-blue-900 shadow-blue-100",
  "bg-purple-100 border-purple-200 text-purple-900 shadow-purple-100",
  "bg-emerald-100 border-emerald-200 text-emerald-900 shadow-emerald-100",
  "bg-rose-100 border-rose-200 text-rose-900 shadow-rose-100",
  "bg-amber-100 border-amber-200 text-amber-900 shadow-amber-100",
  "bg-cyan-100 border-cyan-200 text-cyan-900 shadow-cyan-100",
  "bg-indigo-100 border-indigo-200 text-indigo-900 shadow-indigo-100",
];

const MatchingExercise: React.FC<MatchingExerciseProps> = ({
  exercise,
  matches,
  setMatches,
  selectedLeft,
  setSelectedLeft,
  submitted,
}) => {
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rightRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number; color: string }[]
  >([]);

  const shuffledRightSide = useMemo(() => {
    return exercise.content.pairs
      .map((p: any, i: number) => ({ text: p.right, originalIndex: i }))
      .sort(() => Math.random() - 0.5);
  }, [exercise]);

  useLayoutEffect(() => {
    const calculateLines = () => {
      if (!leftColRef.current || !rightColRef.current) return;

      const newLines: any[] = [];
      const wrapper = leftColRef.current.closest(".relative");
      if (!wrapper) return;
      const wrapperRect = wrapper.getBoundingClientRect();

      // 1. Draw User Lines
      Object.entries(matches).forEach(([leftIdxStr, rightIdx]) => {
        const leftIdx = parseInt(leftIdxStr);
        const leftEl = leftRefs.current[leftIdx];

        const rightRenderIdx = shuffledRightSide.findIndex(
          (p: any) => p.originalIndex === rightIdx
        );
        const rightEl = rightRefs.current[rightRenderIdx];

        if (leftEl && rightEl) {
          const leftRect = leftEl.getBoundingClientRect();
          const rightRect = rightEl.getBoundingClientRect();

          const x1 = leftRect.right - wrapperRect.left;
          const y1 = leftRect.top + leftRect.height / 2 - wrapperRect.top;
          const x2 = rightRect.left - wrapperRect.left;
          const y2 = rightRect.top + rightRect.height / 2 - wrapperRect.top;

          const colors = [
            "#c2410c",
            "#1d4ed8",
            "#7e22ce",
            "#047857",
            "#be123c",
            "#b45309",
            "#0e7490",
            "#4338ca",
          ];
          const strokeColor = colors[leftIdx % colors.length];

          // Check if this specific line is wrong
          const isWrong = submitted && leftIdx !== rightIdx;

          newLines.push({
            x1,
            y1,
            x2,
            y2,
            color: isWrong ? "#ef4444" : strokeColor, // Red if wrong
            dashed: false,
            opacity: isWrong ? 0.4 : 1,
          });
        }
      });

      // 2. Draw Solution Lines (if submitted) for unmatched or wrongly matched items
      if (submitted) {
        exercise.content.pairs.forEach((_: any, leftIdx: number) => {
          const userMatchedRightIdx = matches[leftIdx];
          const isCorrectlyMatched = userMatchedRightIdx === leftIdx;

          if (!isCorrectlyMatched) {
            // Determine correct right element (where originalIndex === leftIdx)
            const rightRenderIdx = shuffledRightSide.findIndex(
              (p) => p.originalIndex === leftIdx
            );

            const leftEl = leftRefs.current[leftIdx];
            const rightEl = rightRefs.current[rightRenderIdx];

            if (leftEl && rightEl) {
              const leftRect = leftEl.getBoundingClientRect();
              const rightRect = rightEl.getBoundingClientRect();

              const x1 = leftRect.right - wrapperRect.left;
              const y1 = leftRect.top + leftRect.height / 2 - wrapperRect.top;
              const x2 = rightRect.left - wrapperRect.left;
              const y2 = rightRect.top + rightRect.height / 2 - wrapperRect.top;

              newLines.push({
                x1,
                y1,
                x2,
                y2,
                color: "#22c55e", // Green
                dashed: true,
                opacity: 0.8,
              });
            }
          }
        });
      }

      setLines(newLines);
    };

    const timeout = setTimeout(calculateLines, 50);
    window.addEventListener("resize", calculateLines);

    return () => {
      window.removeEventListener("resize", calculateLines);
      clearTimeout(timeout);
    };
  }, [matches, exercise, shuffledRightSide, submitted]);

  const handleMatch = (leftIndex: number, rightIndex: number) => {
    if (submitted) return;

    if (leftIndex !== -1) {
      if (selectedLeft === leftIndex) {
        setSelectedLeft(null);
        return;
      }
      setSelectedLeft(leftIndex);
      return;
    }

    if (rightIndex !== -1) {
      if (selectedLeft !== null) {
        const oldLeft = Object.keys(matches).find(
          (k) => matches[parseInt(k)] === rightIndex
        );
        const newMatches = { ...matches };
        if (oldLeft) delete newMatches[parseInt(oldLeft)];

        newMatches[selectedLeft] = rightIndex;
        setMatches(newMatches);
        setSelectedLeft(null);
      } else {
        toast.info("Vui lòng chọn thẻ bên trái trước!");
      }
    }
  };

  const handleUnmatch = (leftIndex: number) => {
    if (submitted) return;
    const newMatches = { ...matches };
    delete newMatches[leftIndex];
    setMatches(newMatches);
  };

  return (
    <div className="relative">
      {/* SVG Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
        {lines.map((line: any, i) => (
          <path
            key={i}
            d={`M ${line.x1} ${line.y1} C ${line.x1 + 50} ${line.y1}, ${
              line.x2 - 50
            } ${line.y2}, ${line.x2} ${line.y2}`}
            stroke={line.color}
            strokeWidth="3"
            fill="none"
            strokeDasharray={line.dashed ? "10,10" : "none"}
            opacity={line.opacity || 1}
            className={!line.dashed ? "animate-[dash_1s_linear_infinite]" : ""}
            style={!line.dashed ? { strokeDasharray: "none" } : {}}
          />
        ))}
      </svg>

      <div className="grid grid-cols-2 gap-4 sm:gap-8 relative z-20">
        {/* Left Column */}
        <div className="flex flex-col gap-2" ref={leftColRef}>
          {exercise.content.pairs.map((p: any, i: number) => {
            const matchedRightIndex = matches[i];
            const isMatched = matchedRightIndex !== undefined;
            const isSelected = selectedLeft === i;

            const colorClass = isMatched
              ? PAIR_COLORS[i % PAIR_COLORS.length]
              : "";
            const badgeNumber = i + 1;

            const isCorrectMatch = submitted && matchedRightIndex === i;
            const isWrongMatch =
              submitted && isMatched && matchedRightIndex !== i;

            return (
              <button
                key={i}
                ref={(el) => (leftRefs.current[i] = el)}
                disabled={submitted || isMatched}
                onClick={() =>
                  isMatched ? handleUnmatch(i) : handleMatch(i, -1)
                }
                className={`
                    relative w-full h-16 sm:h-24 rounded-xl border-2 p-2 flex flex-col items-center justify-center transition-all duration-300
                    ${
                      isSelected
                        ? "border-slate-900 ring-4 ring-slate-100 bg-white z-20 scale-105 shadow-xl"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300"
                    }
                    ${
                      isMatched
                        ? `${colorClass} border-transparent !opacity-100`
                        : ""
                    }
                    ${
                      isWrongMatch
                        ? "!bg-red-50 !border-red-500 !text-red-900"
                        : ""
                    }
                    ${
                      isCorrectMatch
                        ? "!bg-green-50 !border-green-500 !text-green-900"
                        : ""
                    }
                 `}
              >
                <span className="font-hanzi text-base sm:text-xl font-bold break-words text-center line-clamp-2">
                  {p.left}
                </span>

                <div
                  className={`absolute top-2 left-2 w-6 h-6 rounded-full font-black text-xs flex items-center justify-center border shadow-sm
                       ${
                         isMatched
                           ? "bg-white/50 text-slate-900 border-black/10"
                           : "bg-slate-100 text-slate-400 border-slate-200"
                       }
                   `}
                >
                  {badgeNumber}
                </div>

                {isSelected && !submitted && (
                  <div className="absolute -right-3 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg overflow-visible z-20">
                    <ArrowRightIcon size={14} />
                  </div>
                )}
                {isCorrectMatch && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2Icon size={16} className="text-green-600" />
                  </div>
                )}
                {isWrongMatch && (
                  <div className="absolute top-2 right-2">
                    <XCircleIcon size={16} className="text-red-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-2" ref={rightColRef}>
          {shuffledRightSide.map((p: any, idx: number) => {
            const originalIdx = p.originalIndex;
            const matchedLeftIndices = Object.keys(matches).filter(
              (leftKey) => matches[parseInt(leftKey)] === originalIdx
            );
            const matchedLeftIndexStr = matchedLeftIndices[0];
            const matchedLeftIndex = matchedLeftIndexStr
              ? parseInt(matchedLeftIndexStr)
              : undefined;

            const isMatched = matchedLeftIndex !== undefined;
            const colorClass = isMatched
              ? PAIR_COLORS[matchedLeftIndex % PAIR_COLORS.length]
              : "";
            const badgeNumber = isMatched ? matchedLeftIndex + 1 : null;

            const isCorrectMatch =
              submitted && isMatched && matchedLeftIndex === originalIdx;
            const isWrongMatch =
              submitted && isMatched && matchedLeftIndex !== originalIdx;

            return (
              <button
                key={idx}
                ref={(el) => (rightRefs.current[idx] = el)}
                disabled={submitted}
                onClick={() =>
                  matchedLeftIndex !== undefined
                    ? null
                    : handleMatch(-1, originalIdx)
                }
                className={`
                    relative w-full h-16 sm:h-24 rounded-xl border-2 p-2 flex items-center justify-center transition-all duration-300
                    ${
                      selectedLeft !== null && !isMatched
                        ? "border-slate-300 border-dashed animate-pulse bg-slate-50 cursor-pointer"
                        : "border-slate-100 bg-slate-50/50"
                    }
                    ${
                      isMatched
                        ? `${colorClass} border-transparent !opacity-100 shadow-md`
                        : ""
                    }
                    ${
                      isWrongMatch
                        ? "!bg-red-50 !border-red-500 !text-red-900"
                        : ""
                    }
                    ${
                      isCorrectMatch
                        ? "!bg-green-50 !border-green-500 !text-green-900"
                        : ""
                    }
                 `}
              >
                <span className="font-bold text-xs sm:text-base text-center">
                  {p.text}
                </span>

                {badgeNumber && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/50 text-slate-900 font-black text-xs flex items-center justify-center border border-black/10 shadow-sm">
                    {badgeNumber}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchingExercise;
