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

  // User Answers State
  // Map questionId -> Answer Data
  const [allAnswers, setAllAnswers] = useState<Record<string, any>>({});

  // Current Question Local State (Synced with allAnswers)
  const [currentAnswer, setCurrentAnswer] = useState<any>({});

  // Matching/FillBlanks Local State
  const [localState, setLocalState] = useState<any>({});

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
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let data: any;
      if (id) {
        data = await examPaperService.getUserExam(id);
      } else {
        // AI analyzing simulation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        data = await examPaperService.getRecommendedExam();
      }

      setExam(data);
      // Sort questions by order
      const sortedQuestions = (data.questions || []).sort(
        (a: any, b: any) => a.order - b.order
      );
      setQuestions(sortedQuestions);
    } catch (error) {
      console.error(error);
      toast.error("Không tìm thấy bài tập phù hợp.");
      // If specific ID failed, maybe go back to main list (which is now auto-recommend, so careful)
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
  };

  const handleNext = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      // Load next answer into local state
      const nextQ = questions[currentQuestionIndex + 1];
      setCurrentAnswer(allAnswers[nextQ.id] || {});
      setLocalState({}); // Reset local interaction state (like selected matches)
    }
  };

  const handlePrev = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      // Load prev answer
      const prevQ = questions[currentQuestionIndex - 1];
      setCurrentAnswer(allAnswers[prevQ.id] || {});
      setLocalState({});
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
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!exam) return null;

  if (showResult) {
    const maxTotalScore = questions.reduce((sum, q) => sum + q.points, 0);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
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
              onClick={() => (window.location.href = "/exams")}
              className="flex-1 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Làm bài khác
            </button>
            <button
              onClick={() => window.location.reload()}
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
      <div className="min-h-screen bg-white font-inter flex flex-col">
        {/* Cover Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
            <FileTextIcon className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
            {exam.title}
          </h1>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">
            {exam.description ||
              "Đây là bài kiểm tra kiến thức. Hãy bình tĩnh và làm bài thật tốt nhé."}
          </p>

          <div className="flex items-center gap-6 text-sm font-bold text-slate-400 mb-12">
            <div className="flex items-center gap-2">
              <ListBulletIcon className="w-5 h-5" />
              {questions.length} Câu hỏi
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-5 h-5" />
              Tổng {questions.reduce((s, q) => s + q.points, 0)} điểm
            </div>
          </div>

          <button
            onClick={handleStart}
            className="px-12 py-4 bg-indigo-600 text-white font-black text-lg rounded-[24px] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-3"
          >
            Bắt đầu làm bài <ArrowRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-inter overflow-hidden">
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
                if (ok) navigate("/exams");
              });
          }}
          className="p-2 -ml-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="text-sm font-bold text-slate-700">{exam.title}</div>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
          <div className="max-w-3xl mx-auto">
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
                  submitted={submitted}
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
                  submitted={submitted}
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
                  submitted={submitted}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 rounded-2xl font-bold bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-200 transition-colors"
            >
              Quay lại
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!submitted && !canProceed()}
                className={`flex-1 sm:flex-none px-8 py-3 font-bold rounded-2xl transition-colors bg-slate-900 text-white hover:bg-slate-800`}
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
                disabled={!canProceed()}
                className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Nộp bài
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExamPlay;
