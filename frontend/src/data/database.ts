import { IdiomRow, CharacterAnalysisRow, ExampleSentenceRow } from "../types";

export const TABLE_IDIOMS: IdiomRow[] = [
  {
    id: "id_001",
    hanzi: "做生意",
    pinyin: "zuò shēngyi",
    type: "Quán dụng ngữ",
    level: "Cao cấp",
    source: "qiaoliang",
    vietnameseMeaning: "Làm ăn",
    literalMeaning: "Làm ý nghĩa/sinh kế",
    chineseDefinition: "指以生财为目的的经商活动。",
    figurativeMeaning:
      "Thực hiện các hoạt động kinh doanh với mục đích kiếm lời.",
    origin: "Từ vựng thông dụng trong giao thương.",
    grammar: "Động từ ly hợp (Verb-Object)",
    imageUrl: "",
    videoUrl: "",
  },
  {
    id: "id_12",
    hanzi: "走后门",
    pinyin: "zǒu hòumén",
    type: "Quán dụng ngữ",
    level: "Trung cấp",
    source: "hsk chuẩn",
    vietnameseMeaning:
      "Đi cửa sau (dùng cách không chính thức để đạt mục đích)",
    literalMeaning: "Đi cửa sau",
    chineseDefinition: "比喻通过不正当的手段达到目的。",
    figurativeMeaning:
      "Sử dụng các mối quan hệ cá nhân hoặc hối lộ để giành lợi thế không công bằng.",
    origin:
      "Xưa kia các quan lại thường tiếp khách lén lút qua cửa sau để tránh bị soi xét.",
    grammar: "Động từ ly hợp",
    imageUrl: "",
    videoUrl: "",
  },
];

export const TABLE_CHARACTER_ANALYSIS: CharacterAnalysisRow[] = [
  {
    id: "ca_001_1",
    idiomId: "id_001",
    character: "做",
    pinyin: "zuò",
    meaning: "Làm, chế tác",
  },
  {
    id: "ca_012_1",
    idiomId: "id_12",
    character: "走",
    pinyin: "zǒu",
    meaning: "Tẩu (Đi)",
  },
];

export const TABLE_EXAMPLES: ExampleSentenceRow[] = [
  {
    id: "ex_1",
    idiomId: "id_001",
    chinese: "他经常去越南做生意。",
    pinyin: "Tā jīngcháng qù Yuènán zuò shēngyi.",
    vietnamese: "Anh ấy thường xuyên sang Việt Nam làm ăn.",
  },
];
