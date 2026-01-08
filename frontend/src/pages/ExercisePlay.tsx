import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  TargetIcon,
  Loader2,
  TrophyIcon,
  RotateCcwIcon,
  CheckIcon,
  PlayIcon,
  HistoryIcon,
  LightbulbIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchExercises,
  getUserProgress,
  resetUserProgress,
  saveProgress,
} from "@/services/api/exerciseService";
import { Exercise, ExerciseType } from "@/types";
import { toast } from "@/libs/Toast";
import { loadingService } from "@/libs/Loading";
import MultipleChoiceExercise from "@/components/Exercises/MultipleChoiceExercise";
import MatchingExercise from "@/components/Exercises/MatchingExercise";
import FillBlanksExercise from "@/components/Exercises/FillBlanksExercise";

const ExercisePlay: React.FC = () => {
  const navigate = useNavigate();

  // Data State
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [isAllDone, setIsAllDone] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  // Gameplay State
  const [exerciseQueue, setExerciseQueue] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  // Exercise Interaction State
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Matching Specific State
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});

  // Fill Blanks Specific State
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null);

  // Initial Load
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const [exercisesData, progressData] = await Promise.all([
          fetchExercises(),
          getUserProgress(),
        ]);

        if (!mounted) return;

        setAllExercises(exercisesData || []);
        setUserProgress(progressData || []);

        const currentTotal = (progressData || []).reduce(
          (sum: number, p: any) => sum + p.score,
          0
        );
        setTotalScore(currentTotal);

        if (!exercisesData || exercisesData.length === 0) {
          toast.info("Chưa có bài tập nào.");
          navigate("/");
          return;
        }

        const doneCount = progressData ? progressData.length : 0;

        if (doneCount > 0 && doneCount < exercisesData.length) {
          setShowResumeDialog(true);
          setLoading(false);
        } else if (doneCount >= exercisesData.length) {
          setIsAllDone(true);
          setLoading(false);
        } else {
          startSession(exercisesData, []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải danh sách bài tập");
        navigate("/");
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const sortExercises = (exercises: Exercise[]) => {
    const difficultyOrder: Record<string, number> = {
      easy: 1,
      medium: 2,
      hard: 3,
    };
    return [...exercises].sort((a, b) => {
      const da = difficultyOrder[a.difficulty?.toLowerCase()] || 99;
      const db = difficultyOrder[b.difficulty?.toLowerCase()] || 99;
      return da - db;
    });
  };

  const startSession = (all: Exercise[], progress: any[]) => {
    const doneIds = new Set(progress.map((p: any) => p.exerciseId));
    const remaining = all.filter((ex) => !doneIds.has(ex.id));

    if (remaining.length === 0) {
      setIsAllDone(true);
      setLoading(false);
      return;
    }

    const sorted = sortExercises(remaining);
    setExerciseQueue(sorted);
    setCurrentExerciseIndex(0);
    setExercise(sorted[0]);

    resetGameLocalState();
    setLoading(false);
  };

  const handleResume = () => {
    setShowResumeDialog(false);
    startSession(allExercises, userProgress);
  };

  const handleRestart = async () => {
    loadingService.show("Đang làm mới tiến độ...");
    try {
      setLoading(true);
      await resetUserProgress();
      setUserProgress([]);
      setTotalScore(0);
      setShowResumeDialog(false);
      setIsAllDone(false);
      startSession(allExercises, []);
    } catch (e) {
      toast.error("Không thể làm mới tiến độ");
      setLoading(false);
    } finally {
      loadingService.hide();
    }
  };

  const resetGameLocalState = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
    setMatches({});
    setSelectedLeft(null);
    setActiveBlankIndex(null);
  };

  const checkAnswer = async () => {
    if (!exercise) return;
    let currentScore = 0;

    if (exercise.type === ExerciseType.MULTIPLE_CHOICE) {
      if (userAnswers.selectedOptionId === exercise.content.correctOptionId) {
        currentScore = exercise.points;
      }
    } else if (exercise.type === ExerciseType.MATCHING) {
      let correctCount = 0;
      Object.entries(matches).forEach(([leftIdx, rightIdx]) => {
        if (parseInt(leftIdx) === rightIdx) correctCount++;
      });
      if (correctCount === exercise.content.pairs.length) {
        currentScore = exercise.points;
      } else {
        currentScore = Math.floor(
          (correctCount / exercise.content.pairs.length) * exercise.points
        );
      }
    } else if (exercise.type === ExerciseType.FILL_BLANKS) {
      let correctCount = 0;
      const correctAnswers = exercise.content.correctAnswers || [];

      correctAnswers.forEach((answer: any) => {
        const userAnswer = userAnswers[`blank_${answer.position}`];
        if (userAnswer?.trim().toLowerCase() === answer.word.toLowerCase()) {
          correctCount++;
        }
      });

      if (correctCount === correctAnswers.length) {
        currentScore = exercise.points;
      } else {
        currentScore = Math.floor(
          (correctCount / correctAnswers.length) * exercise.points
        );
      }
    }

    setScore(currentScore);
    setSubmitted(true);
    setActiveBlankIndex(null); // Clear focus

    if (exercise.id) {
      loadingService.show("Đang lưu tiến độ...");
      try {
        await saveProgress(exercise.id, currentScore);
        setTotalScore((prev) => prev + currentScore);
      } catch (e) {
        console.error("Failed to save progress", e);
        toast.error("Không thể lưu tiến độ. Vui lòng thử lại sau.");
      } finally {
        loadingService.hide();
      }
    }

    if (currentScore === exercise.points) {
      toast.success("Tuyệt vời! Bạn đã hoàn thành xuất sắc.");
    } else {
      toast.info(`Bạn đạt được ${currentScore} điểm.`);
    }
  };

  const handleNextExercise = () => {
    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < exerciseQueue.length) {
      setCurrentExerciseIndex(nextIndex);
      setExercise(exerciseQueue[nextIndex]);
      resetGameLocalState();
    } else {
      setIsAllDone(true);
    }
  };

  const handleReplayCurrent = () => {
    resetGameLocalState();
  };

  // --- HELPERS: Check if fully answered ---
  const isFullyAnswered = useMemo(() => {
    if (!exercise) return false;
    if (exercise.type === ExerciseType.MULTIPLE_CHOICE) {
      return !!userAnswers.selectedOptionId;
    }
    if (exercise.type === ExerciseType.MATCHING) {
      // Must match all pairs
      return Object.keys(matches).length === exercise.content.pairs.length;
    }
    if (exercise.type === ExerciseType.FILL_BLANKS) {
      // Must fill all blanks
      const filledCount = Object.values(userAnswers).filter(
        (v: any) => v !== undefined && v !== null && v !== ""
      ).length;

      //lấy số lượng ký tự cần fill dựa vào '[number]' trong exercise.content.text
      const numberOfBlanks =
        exercise.content.text.match(/\[\d+\]/g)?.length || 0;
      return filledCount === numberOfBlanks;
    }
    return false;
  }, [exercise, userAnswers, matches]);

  const isPerfect = score === exercise?.points;
  const isLowScore = exercise && score < exercise.points / 2;

  // --- RENDER ---

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  // --- RESUME DIALOG ---
  if (showResumeDialog) {
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl text-center border border-slate-100">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HistoryIcon className="w-12 h-12 text-blue-600" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-3">
            Chào mừng trở lại!
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Bạn đang thực hiện dở lộ trình bài tập.
            <br />
            Bạn có muốn tiếp tục hay làm lại từ đầu?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleResume}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <PlayIcon size={20} fill="currentColor" />
              Tiếp tục bài tập
            </button>
            <button
              onClick={handleRestart}
              className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcwIcon size={20} />
              Làm lại từ đầu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ALL DONE SCREEN ---
  if (isAllDone) {
    // Calculate Score Tier
    const maxTotalScore = allExercises.reduce((sum, ex) => sum + ex.points, 0);
    const scorePercentage =
      maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;

    let tier: "high" | "medium" | "low" = "low";
    if (scorePercentage >= 80) tier = "high";
    else if (scorePercentage >= 50) tier = "medium";

    // Tier Configs
    const config = {
      high: {
        bgGradient: "from-indigo-50 via-purple-50 to-pink-50",
        iconBg: "from-yellow-100 to-amber-50",
        iconGlow: "bg-yellow-400",
        titleGradient: "from-indigo-900 to-purple-800",
        scoreBg: "bg-indigo-50/50 border-indigo-100/50",
        scoreLabel: "text-indigo-400",
        scoreText: "text-indigo-900",
        buttonBg: "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700",
        title: "Hoàn thành xuất sắc!",
        msg: "Bạn là một bậc thầy ngôn ngữ! Thành tích thật đáng nể.",
        icon: (
          <TrophyIcon className="w-16 h-16 text-amber-500 drop-shadow-sm" />
        ),
      },
      medium: {
        bgGradient: "from-blue-50 via-cyan-50 to-sky-50",
        iconBg: "from-blue-100 to-cyan-50",
        iconGlow: "bg-blue-400",
        titleGradient: "from-blue-900 to-cyan-800",
        scoreBg: "bg-blue-50/50 border-blue-100/50",
        scoreLabel: "text-blue-400",
        scoreText: "text-blue-900",
        buttonBg: "bg-blue-600 shadow-blue-200 hover:bg-blue-700",
        title: "Làm tốt lắm!",
        msg: "Bạn đã nỗ lực rất nhiều. Cố gắng thêm chút nữa để đạt điểm tuyệt đối nhé!",
        icon: <TargetIcon className="w-16 h-16 text-blue-500 drop-shadow-sm" />,
      },
      low: {
        bgGradient: "from-orange-50 via-amber-50 to-yellow-50",
        iconBg: "from-orange-100 to-amber-50",
        iconGlow: "bg-orange-400",
        titleGradient: "from-orange-900 to-red-800",
        scoreBg: "bg-orange-50/50 border-orange-100/50",
        scoreLabel: "text-orange-400",
        scoreText: "text-orange-900",
        buttonBg: "bg-orange-600 shadow-orange-200 hover:bg-orange-700",
        title: "Hoàn thành!",
        msg: "Đừng nản lòng. Hãy ôn tập lại và thử sức lần nữa nhé!",
        icon: (
          <HistoryIcon className="w-16 h-16 text-orange-500 drop-shadow-sm" />
        ),
      },
    }[tier];

    return (
      <div
        className={`h-full bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-6 font-inter`}
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 sm:p-12 max-w-md w-full shadow-2xl text-center border border-white/50 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none" />

          <div className="relative z-10">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div
                className={`absolute inset-0 ${config.iconGlow} rounded-full blur-2xl opacity-20 animate-pulse`}
              />
              <div
                className={`w-full h-full bg-gradient-to-br ${config.iconBg} rounded-full flex items-center justify-center shadow-inner border border-white/50 relative`}
              >
                {config.icon}

                {/* Little stars only for High tier */}
                {tier === "high" && (
                  <>
                    <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce delay-700">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -left-2 text-yellow-400 animate-bounce delay-100">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            </div>

            <h2
              className={`text-4xl font-black mb-3 font-hanzi bg-clip-text text-transparent bg-gradient-to-r ${config.titleGradient}`}
            >
              {config.title}
            </h2>
            <p className="text-slate-500 mb-8 max-w-[90%] mx-auto leading-relaxed">
              {config.msg}
            </p>

            <div className={`${config.scoreBg} rounded-3xl p-6 mb-8 border`}>
              <p
                className={`text-xs uppercase font-bold ${config.scoreLabel} tracking-widest mb-2`}
              >
                Tổng điểm đạt được
              </p>
              <div
                className={`flex items-center justify-center gap-2 text-5xl font-black ${config.scoreText} tracking-tight`}
              >
                <span className="text-3xl opacity-50 align-top mt-1">+</span>
                {totalScore}{" "}
                <span className="text-2xl opacity-40 font-bold ml-1">
                  / {maxTotalScore}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRestart}
                className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${config.buttonBg}`}
              >
                <RotateCcwIcon size={20} />
                Luyện tập lại
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-inter overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 z-20 shadow-sm/50 flex-none">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
          >
            <ArrowLeftIcon size={24} />
          </button>

          <div className="flex flex-col items-center flex-1 mx-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest hidden sm:block">
                {exercise.title}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                    ${
                      exercise.difficulty === "easy"
                        ? "bg-green-100 text-green-700"
                        : exercise.difficulty === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }
                 `}
              >
                {exercise.difficulty}
              </span>
            </div>
            <div className="h-1.5 w-full max-w-[200px] bg-slate-100 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    (currentExerciseIndex / exerciseQueue.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="h-9 px-3 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-700 gap-1.5 font-bold text-sm shadow-sm border border-yellow-100">
            <TrophyIcon size={14} className="text-yellow-500 fill-yellow-500" />
            {totalScore}
          </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-40">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[30px] p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden min-h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TargetIcon size={80} />
            </div>

            <div className="mb-6 relative z-10">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight font-hanzi">
                {exercise.description}
              </h2>
              <div className="mt-1 text-slate-400 font-medium text-xs flex items-center gap-2">
                <LightbulbIcon size={14} />
                <span>Câu hỏi số {currentExerciseIndex + 1}</span>
              </div>
            </div>

            {/* Gameplay Area */}
            <div className="relative z-10">
              {exercise.type === ExerciseType.MULTIPLE_CHOICE && (
                <MultipleChoiceExercise
                  exercise={exercise}
                  userAnswers={userAnswers}
                  setUserAnswers={setUserAnswers}
                  submitted={submitted}
                />
              )}

              {exercise.type === ExerciseType.MATCHING && (
                <MatchingExercise
                  exercise={exercise}
                  matches={matches}
                  setMatches={setMatches}
                  selectedLeft={selectedLeft}
                  setSelectedLeft={setSelectedLeft}
                  submitted={submitted}
                />
              )}

              {exercise.type === ExerciseType.FILL_BLANKS && (
                <FillBlanksExercise
                  exercise={exercise}
                  userAnswers={userAnswers}
                  setUserAnswers={setUserAnswers}
                  activeBlankIndex={activeBlankIndex}
                  setActiveBlankIndex={setActiveBlankIndex}
                  submitted={submitted}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {!submitted ? (
            <button
              onClick={checkAnswer}
              disabled={!isFullyAnswered}
              className={`w-full sm:w-80 py-4 rounded-3xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider
                  ${
                    isFullyAnswered
                      ? "bg-red-600 text-white shadow-red-200 hover:bg-red-700 active:scale-95 translate-y-0"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }
                `}
            >
              <CheckIcon size={24} />
              Nộp bài
            </button>
          ) : (
            <div className="w-full animate-[slide-up_0.3s_ease-out]">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Result Summary Mini-View */}
                <div
                  className={`flex-1 w-full p-4 rounded-2xl flex items-center gap-4 ${
                    isPerfect
                      ? "bg-green-50 border border-green-100"
                      : isLowScore
                      ? "bg-rose-50 border border-rose-100"
                      : "bg-blue-50 border border-blue-100"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border-2 border-white shrink-0 ${
                      isPerfect
                        ? "bg-green-500 text-white"
                        : isLowScore
                        ? "bg-rose-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {isPerfect ? (
                      <TrophyIcon size={20} />
                    ) : isLowScore ? (
                      <TargetIcon size={20} />
                    ) : (
                      <CheckCircle2Icon size={20} />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`font-black text-sm ${
                        isPerfect
                          ? "text-green-800"
                          : isLowScore
                          ? "text-rose-800"
                          : "text-blue-800"
                      }`}
                    >
                      {isPerfect ? "Xuất sắc!" : "Hoàn thành"}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">
                      +{score} điểm
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleReplayCurrent}
                    className="flex-1 sm:flex-none px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <RotateCcwIcon size={20} />
                  </button>
                  <button
                    onClick={handleNextExercise}
                    className="flex-[2] sm:flex-none px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-95"
                  >
                    Tiếp tục
                    <ArrowRightIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisePlay;
