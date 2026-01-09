import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, BrainCircuit } from "lucide-react";
import { examPaperService } from "@/services/api";
import { toast } from "@/libs/Toast";

const ExamList: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const findAndStartExam = async () => {
      try {
        // Add a small artificial delay for better UX (so user sees the "Analyzing" state)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const recommended = await examPaperService.getRecommendedExam();
        if (recommended && recommended.id) {
          navigate(`/exams/${recommended.id}`);
        } else {
          toast.error("Không tìm thấy bài tập phù hợp.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Hệ thống đang bận, vui lòng thử lại sau.");
      }
    };

    findAndStartExam();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-inter">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
        <div className="relative bg-white rounded-[40px] p-12 shadow-2xl border border-slate-100 max-w-lg w-full">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <BrainCircuit className="w-12 h-12 text-indigo-600" />
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-4">
            Đang phân tích dữ liệu...
          </h1>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">
            Hệ thống AI đang tìm kiếm bài tập phù hợp nhất với trình độ hiện tại
            của bạn. Vui lòng chờ trong giây lát.
          </p>

          <div className="flex items-center justify-center gap-3 text-indigo-600 font-bold bg-indigo-50 py-3 px-6 rounded-2xl">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang tìm bài tập...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamList;
