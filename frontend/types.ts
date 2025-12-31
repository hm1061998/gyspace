export type SearchMode = "database" | "ai";

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
  idiomHanzi: string;
  username: string;
  content: string;
  timestamp: number;
  isPremium: boolean;
  likes: number;
}
