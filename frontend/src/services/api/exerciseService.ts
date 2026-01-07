import { http } from "./httpService";
import { Exercise } from "@/types";

export const fetchExercises = async () => {
  const response = await http.get<Exercise[]>("/exercises");
  return response.data;
};

export const fetchExerciseById = async (id: string) => {
  const response = await http.get<Exercise>(`/exercises/${id}`);
  return response.data;
};

export const createExercise = async (data: Partial<Exercise>) => {
  const response = await http.post<Exercise>("/exercises", data);
  return response.data;
};

export const updateExercise = async (id: string, data: Partial<Exercise>) => {
  const response = await http.patch<Exercise>(`/exercises/${id}`, data);
  return response.data;
};

export const deleteExercise = async (id: string) => {
  const response = await http.delete(`/exercises/${id}`);
  return response.data;
};

export const getUserProgress = async () => {
  const response = await http.get<
    {
      id: string;
      userId: string;
      exerciseId: string;
      score: number;
      completedAt: string;
    }[]
  >("/exercises/progress");
  return response.data;
};

export const saveProgress = async (exerciseId: string, score: number) => {
  const response = await http.post("/exercises/progress", {
    exerciseId,
    score,
  });
  return response.data;
};

export const resetUserProgress = async () => {
  const response = await http.delete("/exercises/progress");
  return response.data;
};
