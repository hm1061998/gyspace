import React, { useEffect, useState } from "react";
import {
  BrainIcon,
  SparklesIcon,
  CalendarIcon,
} from "@/components/common/icons";
import {
  fetchSuggestions,
  fetchDailySuggestions,
} from "@/services/api/idiomService";
import type { Idiom } from "@/types";

interface DailySuggestionsProps {
  onSelect: (keyword: string) => void;
}

// Mock data for fallback
const FALLBACK_DAILY_KEYWORDS = [
  {
    hanzi: "一石二鸟",
    pinyin: "yī shí èr niǎo",
    vietnameseMeaning: "Một mũi tên trúng hai đích",
  },
  {
    hanzi: "画蛇添足",
    pinyin: "huà shé tiān zú",
    vietnameseMeaning: "Vẽ rắn thêm chân (Thừa thãi)",
  },
  {
    hanzi: "半途而废",
    pinyin: "bàn tú ér fèi",
    vietnameseMeaning: "Bỏ cuộc giữa chừng",
  },
  {
    hanzi: "对牛弹琴",
    pinyin: "duì niú tán qín",
    vietnameseMeaning: "Đàn gảy tai trâu",
  },
  {
    hanzi: "车水马龙",
    pinyin: "chē shuǐ mǎ lóng",
    vietnameseMeaning: "Xe như nước, ngựa như rồng (Sầm uất)",
  },
];

const DailySuggestions: React.FC<DailySuggestionsProps> = ({ onSelect }) => {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current date formatted
  const today = new Date();
  const dateStr = today.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    const loadDaily = async () => {
      try {
        setLoading(true);
        const data = await fetchDailySuggestions();

        if (data && data.length > 0) {
          setKeywords(data);
        } else {
          // Fallback if no data from backend
          setKeywords(FALLBACK_DAILY_KEYWORDS.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch daily suggestions", err);
        setKeywords(FALLBACK_DAILY_KEYWORDS.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    loadDaily();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-pop">
      <div className="flex flex-col items-center">
        {/* Date Header */}
        <div className="flex items-center gap-2 mb-6 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
          <CalendarIcon className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {dateStr}
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-6 relative">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-1 relative z-10">
            Hôm nay học gì?
          </h2>
          <div className="absolute -top-4 -right-4 text-yellow-400 animate-bounce delay-700">
            <SparklesIcon className="w-6 h-6" />
          </div>
          {/* <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto">
            Khám phá những từ khóa nổi bật dành riêng cho bạn
          </p> */}
        </div>

        {/* Grid of Chips */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center p-3 bg-white/50 border border-slate-100 rounded-2xl h-[84px] animate-pulse"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-200 mr-3 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-4">
            {keywords.map((item, index) => (
              <button
                key={index}
                onClick={() => onSelect(item.hanzi)}
                className="group relative flex items-center p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left"
              >
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BrainIcon className="w-12 h-12 text-red-600 rotate-12" />
                </div>

                {/* Number Badge */}
                <div className="mr-3 flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                    <span className="font-hanzi font-black text-base text-slate-400 group-hover:text-white">
                      {index + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <h3 className="text-lg font-hanzi font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                      {item.hanzi}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      / {item.pinyin} /
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 group-hover:text-slate-600">
                    {item.vietnameseMeaning}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer Hint */}
        {/* <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 font-medium opacity-60">
           <SparklesIcon className="w-3 h-3" />
           <span>Cập nhật mỗi ngày lúc 00:00</span>
        </div> */}
      </div>
    </div>
  );
};

export default DailySuggestions;
