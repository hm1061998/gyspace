export interface CharacterAnalysisRow {
  id: string;
  idiomId: string;
  character: string;
  pinyin: string;
  meaning: string;
}

export interface ExampleSentenceRow {
  id: string;
  idiomId: string;
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

export interface IdiomRow {
  id: string;
  hanzi: string;
  pinyin: string;
  type: string;
  usageContext?: string;
  vietnameseMeaning: string;
  literalMeaning: string;
  figurativeMeaning: string;
  chineseDefinition?: string; // MỚI: Nghĩa tiếng Trung
  source?: string; // MỚI: Vị trí xuất hiện (Qiaoliang, HSK...)
  level?: string; // MỚI: Cấp độ (Trung cấp, Cao cấp)
  origin: string;
  grammar: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface Idiom extends IdiomRow {
  analysis: Omit<CharacterAnalysisRow, "id" | "idiomId">[];
  examples: Omit<ExampleSentenceRow, "id" | "idiomId">[];
}

export interface Feedback {
  id: string;
  content: string;
  likes: number;
  status: "pending" | "approved" | "rejected";
  reportCount: number;
  user: {
    id: string;
    username: string;
    displayName?: string;
    isAdmin: boolean;
  };
  idiom?: {
    id: string;
    hanzi: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Common Query Parameters for APIs
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  filter?: string | Record<string, any>;
  sort?: string; // Standardized to "field,order" (e.g., "createdAt,DESC")
}

// Common Paginated Response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
    hasMore?: boolean;
  };
}
export enum ExerciseType {
  MATCHING = "MATCHING",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  FILL_BLANKS = "FILL_BLANKS",
}

export interface Exercise {
  id: string;
  title: string;
  description?: string;
  type: ExerciseType;
  content: any;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  createdAt: string;
  updatedAt: string;
}
