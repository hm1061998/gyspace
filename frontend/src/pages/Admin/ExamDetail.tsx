import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  DocumentIcon,
  ListBulletIcon,
} from "@/components/common/icons";
import {
  examPaperService,
  examQuestionService,
  ExamPaper,
  ExamQuestion,
} from "@/services/api";
import { toast } from "@/libs/Toast";
import { modalService } from "@/libs/Modal";
import { loadingService } from "@/libs/Loading";
import Table from "@/components/common/Table";
import Tooltip from "@/components/common/Tooltip";

const ExamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPaper = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response: any = await examPaperService.getOne(id);
      setPaper(response);
    } catch (error) {
      toast.error("Không thể tải thông tin bài tập");
      navigate("/admin/exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const handleDeleteQuestion = async (questionId: string) => {
    const confirmed = await modalService.danger(
      "Xóa câu hỏi này?",
      "Xác nhận xóa"
    );
    if (!confirmed) return;
    try {
      loadingService.show("Đang xóa...");
      await examQuestionService.delete(questionId);
      toast.success("Đã xóa câu hỏi");
      fetchPaper();
    } catch (error) {
      toast.error("Lỗi khi xóa câu hỏi");
    } finally {
      loadingService.hide();
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "MATCHING":
        return "Nối từ";
      case "MULTIPLE_CHOICE":
        return "Trắc nghiệm";
      case "FILL_BLANKS":
        return "Điền từ";
      default:
        return type;
    }
  };

  const totalPoints =
    paper?.questions?.reduce((acc, q) => acc + (q.points || 0), 0) || 0;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 relative">
      {/* Fixed Header */}
      <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/exams")}
                className="p-2 -ml-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                title="Quay lại"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-3">
                  <DocumentIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                  {paper?.title || "Chi tiết bài tập"}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium italic mt-0.5">
                  {paper?.description || "Quản lý danh sách câu hỏi"}
                </p>
              </div>
            </div>
            <Tooltip content="Thêm câu hỏi mới" position="left">
              <button
                onClick={() => navigate(`/admin/exams/${id}/questions/new`)}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 group text-sm"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" />
                <span className="hidden sm:inline">Thêm câu hỏi</span>
                <span className="sm:hidden">Thêm</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-7xl mx-auto w-full h-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
          <Table<ExamQuestion>
            className="flex-1 min-h-0"
            loading={loading}
            data={paper?.questions || []}
            keyExtractor={(item) => item.id}
            emptyMessage="Chưa có câu hỏi nào. Hãy thêm câu hỏi mới!"
            columns={[
              {
                header: "STT",
                className: "w-16 text-center",
                cell: (item, index) => (
                  <span className="font-bold text-slate-400">{index + 1}</span>
                ),
              },
              {
                header: "Loại câu hỏi",
                cell: (item) => (
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider
                                    ${
                                      item.type === "MATCHING"
                                        ? "bg-purple-100 text-purple-600 border border-purple-200"
                                        : item.type === "MULTIPLE_CHOICE"
                                        ? "bg-blue-100 text-blue-600 border border-blue-200"
                                        : "bg-orange-100 text-orange-600 border border-orange-200"
                                    }
                                `}
                  >
                    {getTypeLabel(item.type)}
                  </span>
                ),
              },
              {
                header: "Điểm",
                cell: (item) => (
                  <span className="font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg text-xs">
                    {item.points} điểm
                  </span>
                ),
              },
              {
                header: "Nội dung tóm tắt",
                cell: (item) => {
                  if (item.type === "MULTIPLE_CHOICE")
                    return (
                      <span
                        className="text-slate-600 text-sm font-medium truncate max-w-xs block"
                        title={item.content.question}
                      >
                        {item.content.question}
                      </span>
                    );
                  if (item.type === "FILL_BLANKS")
                    return (
                      <span
                        className="text-slate-600 text-sm font-medium truncate max-w-xs block"
                        title={item.content.text}
                      >
                        {item.content.text}
                      </span>
                    );
                  return (
                    <span className="text-slate-400 text-sm italic">
                      {getTypeLabel(item.type)} Content
                    </span>
                  );
                },
              },
              {
                header: "Thao tác",
                className: "text-right",
                cell: (item) => (
                  <div className="flex justify-end gap-2">
                    <Tooltip content="Chỉnh sửa">
                      <button
                        onClick={() =>
                          navigate(`/admin/exams/${id}/questions/${item.id}`)
                        }
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Xóa">
                      <button
                        onClick={() => handleDeleteQuestion(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </Tooltip>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Fixed Footer Stats */}
      <div className="flex-none bg-white border-t border-slate-200 py-3 shadow-[0_-4px_6_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Tổng câu hỏi
                </span>
                <span className="text-lg font-black text-slate-800">
                  {paper?.questions?.length || 0}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  Tổng điểm
                </span>
                <span className="text-lg font-black text-red-600">
                  {totalPoints}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;
