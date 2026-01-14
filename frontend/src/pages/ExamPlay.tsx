import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft as ArrowLeftIcon,
  Check as CheckIcon,
  Loader2,
  Trophy as TrophyIcon,
  RotateCcw as RotateCcwIcon,
  ArrowRight as ArrowRightIcon,
  Lightbulb as LightbulbIcon,
  List as ListBulletIcon,
  XCircle as XCircleIcon,
} from "lucide-react"; // Using local icons
import { useNavigate, useParams } from "react-router-dom";
import { examPaperService, ExamPaper, ExamQuestion } from "@/services/api";
import { toast } from "@/libs/Toast";
import { loadingService } from "@/libs/Loading";
import MultipleChoiceExercise from "@/components/Exercises/MultipleChoiceExercise";
import MatchingExercise from "@/components/Exercises/MatchingExercise";
import FillBlanksExercise from "@/components/Exercises/FillBlanksExercise";
import { Exercise, ExerciseType } from "@/types";
import { modalService } from "@/libs/Modal/services/modalService";
import { FileTextIcon } from "@/components/common/icons";
import { fetchSavedIdioms } from "@/services/api/userDataService";

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const ExamPlay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data State
  const [exam, setExam] = useState<ExamPaper | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [mode, setMode] = useState<"all" | "saved">("all");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // User Answers State
  // Map questionId -> Answer Data
  const [allAnswers, setAllAnswers] = useState<Record<string, any>>({});

  // Current Question Local State (Synced with allAnswers)
  const [currentAnswer, setCurrentAnswer] = useState<any>({});

  // Matching/FillBlanks Local State
  const [localState, setLocalState] = useState<any>({});
  const [isDisabledStartBtn, setIsDisabledStartBtn] = useState(false);

  const currentQ = questions[currentQuestionIndex];

  // Question Interface
  // Mock Exercise object for compatibility
  const mockExercise = useMemo(() => {
    if (!currentQ) return {} as Exercise;
    return {
      ...currentQ,
      difficulty: "medium", // Dummy
      title: `Câu hỏi ${currentQuestionIndex + 1}`,
      description: `Câu hỏi ${currentQuestionIndex + 1}/${questions.length}`,
    } as unknown as Exercise;
  }, [currentQ, currentQuestionIndex, questions.length]);

  useEffect(() => {
    if (started) return; // Don't refetch if already playing
    fetchData();
  }, [id, mode]);

  const generateSavedWordsExam = async () => {
    loadingService.show();
    const response = await fetchSavedIdioms({ page: 1, limit: 100 });

    loadingService.hide();
    const saved = response.data;

    if (saved.length < 4) {
      setIsDisabledStartBtn(true);
      throw new Error("Bạn cần lưu ít nhất 4 từ để luyện tập chế độ này.");
    }
    const shuffled = shuffleArray(saved);
    const selected = shuffled.slice(0, 10); // Take 10 words

    const qList: ExamQuestion[] = [];

    // 1. Multiple Choice
    selected.slice(0, 5).forEach((idiom, idx) => {
      const distractors = shuffleArray(
        saved.filter((i) => i.id !== idiom.id)
      ).slice(0, 3);
      const options = shuffleArray([
        { id: "correct", text: idiom.vietnameseMeaning },
        ...distractors.map((d, i) => ({
          id: `wrong_${i}`,
          text: d.vietnameseMeaning,
        })),
      ]);

      qList.push({
        id: `saved_mc_${idx}`,
        examPaperId: "saved",
        type: "MULTIPLE_CHOICE",
        points: 10,
        order: idx,
        content: {
          question: `Nghĩa của từ "${idiom.hanzi}" là gì?`,
          options: options,
          correctOptionId: "correct",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // 2. Matching
    if (selected.length >= 8) {
      const matchWords = selected.slice(5, 9);
      qList.push({
        id: `saved_match_1`,
        examPaperId: "saved",
        type: "MATCHING",
        points: 30,
        order: 5,
        content: {
          pairs: matchWords.map((i) => ({
            left: i.hanzi,
            right: i.vietnameseMeaning,
          })),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      id: "saved_exam",
      title: "Luyện tập từ đã lưu",
      description:
        "Bài tập được tổng hợp từ danh sách từ vựng cá nhân của bạn.",
      questions: qList,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ExamPaper;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let data: any;
      if (mode === "saved") {
        data = await generateSavedWordsExam();
      } else if (id) {
        data = await examPaperService.getUserExam(id);
      } else {
        data = await examPaperService.getRecommendedExam();
      }

      setIsDisabledStartBtn(false);

      setExam(data);
      const shuffledQuestions = shuffleArray(data.questions || []);
      setQuestions(shuffledQuestions);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Không tìm thấy bài tập phù hợp.");
      if (id) navigate("/exams");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (questions.length === 0) {
      toast.error("Bài tập này chưa có câu hỏi nào.");
      return;
    }
    setStarted(true);
    setCurrentQuestionIndex(0);
    setIsChecked(false);
    setIsCorrect(null);
  };

  const handleNext = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      const nextQ = questions[currentQuestionIndex + 1];
      setCurrentAnswer(allAnswers[nextQ.id] || {});
      setLocalState({});
      setIsChecked(false);
      setIsCorrect(null);
    }
  };

  const handlePrev = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQ = questions[currentQuestionIndex - 1];
      setCurrentAnswer(allAnswers[prevQ.id] || {});
      setLocalState({});
      setIsChecked(false);
      setIsCorrect(null);
    }
  };

  const checkCurrentAnswer = () => {
    const q = currentQ;
    const ans = currentAnswer;
    let correct = false;

    if (q.type === "MULTIPLE_CHOICE") {
      correct = ans.selectedOptionId === q.content.correctOptionId;
    } else if (q.type === "MATCHING") {
      const matches = ans.matches || {};
      const pairs = q.content.pairs || [];
      let correctCount = 0;
      Object.entries(matches).forEach(([l, r]) => {
        if (parseInt(l) === (r as number)) correctCount++;
      });
      correct = correctCount === pairs.length;
    } else if (q.type === "FILL_BLANKS") {
      const correctAnswers = q.content.correctAnswers || [];
      let correctCount = 0;
      correctAnswers.forEach((ca: any) => {
        const userWord = ans[`blank_${ca.position}`];
        if (userWord?.trim().toLowerCase() === ca.word.trim().toLowerCase()) {
          correctCount++;
        }
      });
      correct = correctCount === correctAnswers.length;
    }

    setIsCorrect(correct);
    setIsChecked(true);

    if (correct) {
      toast.success("Chính xác! Tiếp tục phát huy nhé.");
    } else {
      toast.error("Chưa đúng rồi. Hãy xem lại kỹ nhé!");
    }
  };

  const saveCurrentAnswer = () => {
    const currentQ = questions[currentQuestionIndex];
    setAllAnswers((prev) => ({
      ...prev,
      [currentQ.id]: currentAnswer,
    }));
  };

  // Calculate Result
  const handleSubmitConfirm = async () => {
    const confirmed = await modalService.confirm(
      "Bạn có chắc chắn muốn nộp bài? Hãy kiểm tra kỹ các câu trả lời trước khi xác nhận.",
      "Nộp bài tập"
    );
    if (confirmed) {
      saveCurrentAnswer(); // Save last one
      submitExam();
    }
  };

  const submitExam = () => {
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach((q) => {
      const ans = allAnswers[q.id] || {}; // IMPORTANT: Read from STATE!
      // Wait, saveCurrentAnswer is async in react state sense, might not be ready if called immediately?
      // Actually updating state based on prev is fine, but read back might be stale in same tick.
      // Better to merge currentAnswer into allAnswers locally for calculation

      let effectiveAns = ans;
      if (q.id === questions[currentQuestionIndex].id) {
        effectiveAns = currentAnswer;
      }

      maxScore += q.points;

      if (q.type === "MULTIPLE_CHOICE") {
        if (effectiveAns.selectedOptionId === q.content.correctOptionId) {
          totalScore += q.points;
        }
      } else if (q.type === "MATCHING") {
        // effectiveAns should contain 'matches'
        const matches = effectiveAns.matches || {};
        let correctCount = 0;
        const pairs = q.content.pairs || [];
        Object.entries(matches).forEach(([leftIdx, rightIdx]) => {
          // Check if pairs[leftIdx] matches pairs[rightIdx] logic?
          // Usually matching logic: left index map to right index.
          // If pairs are {left: 'A', right: 'B'}. Left 0 -> Right 0 is correct.
          if (parseInt(leftIdx) === (rightIdx as number)) correctCount++;
        });

        if (pairs.length > 0) {
          if (correctCount === pairs.length) totalScore += q.points;
          else
            totalScore += Math.floor((correctCount / pairs.length) * q.points);
        }
      } else if (q.type === "FILL_BLANKS") {
        // effectiveAns contains key "blank_N": "word"
        const correctAnswers = q.content.correctAnswers || [];
        let correctCount = 0;
        correctAnswers.forEach((ca: any) => {
          const userWord = effectiveAns[`blank_${ca.position}`];
          if (userWord?.trim().toLowerCase() === ca.word.trim().toLowerCase()) {
            correctCount++;
          }
        });
        if (correctAnswers.length > 0) {
          if (correctCount === correctAnswers.length) totalScore += q.points;
          else
            totalScore += Math.floor(
              (correctCount / correctAnswers.length) * q.points
            );
        }
      }
    });

    setScore(totalScore);
    setSubmitted(true);
    setShowResult(true);
  };

  // Wrappers for Matching State to sync with currentAnswer
  const setMatchesWrapper = (valOrFn: any) => {
    // Logic to update `matches` inside `currentAnswer`
    // MatchingExercise calls setMatches(newMatches) or setMatches(prev => ...)

    // We want `currentAnswer` to look like { matches: ... }
    setCurrentAnswer((prev: any) => {
      const oldMatches = prev.matches || {};
      const newMatches =
        typeof valOrFn === "function" ? valOrFn(oldMatches) : valOrFn;
      return { ...prev, matches: newMatches };
    });
  };

  const handleReset = () => {
    setStarted(false);
    setSubmitted(false);
    setShowResult(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setAllAnswers({});
    setCurrentAnswer({});
    setLocalState({});
  };

  const handleOtherExam = () => {
    handleReset();
    setExam(null);
    setQuestions([]);
    fetchData();
  };

  const getMatches = () => currentAnswer.matches || {};

  // Validation Check
  const canProceed = () => {
    if (submitted) return true; // Always allow navigation in review mode without checking answers

    // Check if current question is answered
    if (currentQ.type === "MULTIPLE_CHOICE") {
      return !!currentAnswer.selectedOptionId;
    }

    if (currentQ.type === "MATCHING") {
      // Must match at least one pair? Or all pairs?
      // Strict exam: match ALL pairs.
      const matches = currentAnswer.matches || {};
      const pairsCount = currentQ.content.pairs?.length || 0;

      if (pairsCount === 0) return true;

      // Ensure all left items have a match
      // But actually matching logic is Object.keys(matches).length === pairsCount
      // BUT, keys are indices.
      return Object.keys(matches).length === pairsCount;
    }

    if (currentQ.type === "FILL_BLANKS") {
      // Must fill ALL blanks
      const correctAnswers = currentQ.content.correctAnswers || [];
      const totalBlanks = correctAnswers.length;

      // If no blanks defined, technically it's weird, but return true? No, return false.
      if (totalBlanks === 0) return true;

      const allFilled = correctAnswers.every(
        (ans: any) => !!currentAnswer[`blank_${ans.position}`]
      );
      return allFilled;
    }

    return true; // Default allow for other types (unknown)
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!exam) return null;

  if (showResult) {
    const maxTotalScore = questions.reduce((sum, q) => sum + q.points, 0);
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center p-6 font-inter">
        <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-xl border border-slate-100 text-center">
          <TrophyIcon className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            Hoàn thành bài tập!
          </h2>
          <p className="text-slate-500 mb-8">{exam.title}</p>

          <div className="bg-indigo-50 rounded-2xl p-6 mb-8">
            <p className="text-indigo-400 font-bold uppercase text-xs tracking-wider mb-2">
              Tổng điểm
            </p>
            <p className="text-5xl font-black text-indigo-900">
              {score}{" "}
              <span className="text-2xl text-indigo-300">
                / {maxTotalScore}
              </span>
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowResult(false);
                setCurrentQuestionIndex(0);
                if (questions.length > 0) {
                  const firstQ = questions[0];
                  setCurrentAnswer(allAnswers[firstQ.id] || {});
                  setLocalState({});
                }
              }}
              className="flex-1 py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50"
            >
              Xem đáp án
            </button>
            <button
              onClick={handleOtherExam}
              className="flex-1 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Làm bài khác
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            >
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="h-full bg-slate-50 font-inter flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto w-full">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-6 animate-pop rotate-3">
            <FileTextIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2 leading-tight">
            {exam.title}
          </h1>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            {exam.description ||
              "Hãy kiểm tra kiến thức của mình qua bài tập thú vị này nhé!"}
          </p>

          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <button
              onClick={() => setMode("all")}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                mode === "all"
                  ? "bg-white border-indigo-600 shadow-xl"
                  : "bg-white/50 border-slate-100 opacity-60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  mode === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                <RotateCcwIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-800">
                  Tất cả từ
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                  Ngẫu nhiên
                </div>
              </div>
            </button>
            <button
              onClick={() => setMode("saved")}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                mode === "saved"
                  ? "bg-white border-amber-500 shadow-xl"
                  : "bg-white/50 border-slate-100 opacity-60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  mode === "saved"
                    ? "bg-amber-500 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                <CheckIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-800">
                  Từ đã lưu
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                  Cá nhân hóa
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || isDisabledStartBtn}
            className="w-full py-4 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Bắt đầu ngay <ArrowRightIcon className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 font-inter overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 shrink-0">
        <button
          onClick={() => {
            if (submitted) {
              navigate("/exams");
              return;
            }
            modalService
              .confirm(
                "Tiến trình làm bài sẽ không được lưu. Bạn có chắc muốn thoát?",
                "Thoát bài tập"
              )
              .then((ok) => {
                if (ok) navigate("/");
              });
          }}
          className="p-2 -ml-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
          {exam.title}
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 flex flex-col">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                <span>Câu {currentQuestionIndex + 1}</span>
                <span>{questions.length} câu</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100 min-h-[400px]">
              {currentQ.type === "MULTIPLE_CHOICE" && (
                <MultipleChoiceExercise
                  exercise={mockExercise}
                  userAnswers={currentAnswer}
                  setUserAnswers={setCurrentAnswer}
                  submitted={submitted || isChecked}
                />
              )}
              {currentQ.type === "MATCHING" && (
                <MatchingExercise
                  exercise={mockExercise}
                  matches={getMatches()}
                  setMatches={setMatchesWrapper}
                  selectedLeft={localState.selectedLeft ?? null}
                  setSelectedLeft={(val) =>
                    setLocalState({ ...localState, selectedLeft: val })
                  }
                  submitted={submitted || isChecked}
                />
              )}
              {currentQ.type === "FILL_BLANKS" && (
                <FillBlanksExercise
                  exercise={mockExercise}
                  userAnswers={currentAnswer}
                  setUserAnswers={setCurrentAnswer}
                  activeBlankIndex={localState.activeBlankIndex || null}
                  setActiveBlankIndex={(val) =>
                    setLocalState({ ...localState, activeBlankIndex: val })
                  }
                  submitted={submitted || isChecked}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shrink-0 shadow-2xl z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0 || isChecked}
              className="px-6 py-3 rounded-2xl font-bold bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-200 transition-colors"
            >
              Quay lại
            </button>

            {isChecked || submitted ? (
              currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 sm:flex-none px-8 py-3 font-bold rounded-2xl transition-colors bg-slate-900 text-white hover:bg-slate-800 animate-fadeIn"
                >
                  Tiếp theo
                </button>
              ) : submitted ? (
                <button
                  onClick={() => setShowResult(true)}
                  className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transform active:scale-95 transition-all"
                >
                  Xem tổng kết
                </button>
              ) : (
                <button
                  onClick={handleSubmitConfirm}
                  className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transform active:scale-95 transition-all"
                >
                  Nộp bài
                </button>
              )
            ) : (
              <button
                onClick={checkCurrentAnswer}
                disabled={!canProceed()}
                className="flex-1 sm:flex-none px-8 py-3 bg-amber-500 text-white font-black rounded-2xl shadow-lg shadow-amber-200 hover:bg-amber-600 transform active:scale-95 transition-all disabled:opacity-50"
              >
                Kiểm tra
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExamPlay;
