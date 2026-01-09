import { http } from "./httpService";

export interface ExamPaper {
  id: string;
  title: string;
  description: string;
  questions?: ExamQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamQuestion {
  id: string;
  examPaperId: string;
  type: "MATCHING" | "MULTIPLE_CHOICE" | "FILL_BLANKS";
  content: any;
  points: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const examPaperService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await http.get("/admin/exam-papers", params);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await http.get(`/admin/exam-papers/${id}`);
    return response.data;
  },

  create: async (data: { title: string; description?: string }) => {
    const response = await http.post("/admin/exam-papers", data);
    return response.data;
  },

  update: async (
    id: string,
    data: { title?: string; description?: string }
  ) => {
    const response = await http.patch(`/admin/exam-papers/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await http.delete(`/admin/exam-papers/${id}`);
    return response.data;
  },

  // User facing methods
  getUserExams: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await http.get("/exam-papers", params);
    return response.data;
  },

  getRecommendedExam: async () => {
    const response = await http.get("/exam-papers/recommend");
    return response.data;
  },

  getUserExam: async (id: string) => {
    const response = await http.get(`/exam-papers/${id}`);
    return response.data;
  },
};

export const examQuestionService = {
  create: async (data: any) => {
    const response = await http.post("/admin/exam-questions", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await http.patch(`/admin/exam-questions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await http.delete(`/admin/exam-questions/${id}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await http.get(`/admin/exam-questions/${id}`);
    return response.data;
  },
};
