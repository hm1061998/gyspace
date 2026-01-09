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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/exams")}
            className="p-2 -ml-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <DocumentIcon className="w-8 h-8 text-blue-600" />
              {paper?.title || "Chi tiết bài tập"}
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
              {paper?.description || "Quản lý danh sách câu hỏi"}
            </p>
          </div>
        </div>
        <Tooltip content="Thêm câu hỏi mới" position="left">
          <button
            onClick={() => navigate(`/admin/exams/${id}/questions/new`)}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 group"
          >
            <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Thêm câu hỏi
          </button>
        </Tooltip>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <ListBulletIcon className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-700">
            Danh sách câu hỏi ({paper?.questions?.length || 0})
          </h3>
        </div>
        <Table<ExamQuestion>
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
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider
                                    ${
                                      item.type === "MATCHING"
                                        ? "bg-purple-100 text-purple-600"
                                        : item.type === "MULTIPLE_CHOICE"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-orange-100 text-orange-600"
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
                <span className="font-bold text-slate-600">
                  {item.points} điểm
                </span>
              ),
            },
            {
              header: "Nội dung tóm tắt",
              cell: (item) => {
                // Simple preview logic
                if (item.type === "MULTIPLE_CHOICE")
                  return (
                    <span className="text-slate-500 text-sm truncate max-w-xs block">
                      {item.content.question}
                    </span>
                  );
                if (item.type === "FILL_BLANKS")
                  return (
                    <span className="text-slate-500 text-sm truncate max-w-xs block">
                      {item.content.text}
                    </span>
                  );
                return (
                  <span className="text-slate-500 text-sm italic">
                    {item.type} Content
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
  );
};

export default ExamDetail;
