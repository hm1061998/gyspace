import React, { useState, useEffect, useRef } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import {
  fetchIdiomDetails,
  fetchSuggestions,
} from "@/services/api/idiomService";
import type { Idiom, SearchMode } from "@/types";
import IdiomDetail from "@/components/idiom/IdiomDetail";
import HandwritingPad from "@/components/game/HandwritingPad";
import FeaturedComments from "@/components/idiom/FeaturedComments";
import {
  SearchIcon,
  BrainIcon,
  CloseIcon,
  CardIcon,
  PuzzlePieceIcon,
  ArrowLeftIcon,
  MicrophoneIcon,
  ChevronRightIcon,
} from "@/components/common/icons";
import { addToHistory } from "@/services/api/userDataService";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState<string>("");
  const [currentIdiom, setCurrentIdiom] = useState<
    (Idiom & { dataSource: string }) | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>("database");
  const [isHandwritingPadOpen, setIsHandwritingPadOpen] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"vi-VN" | "zh-CN">("vi-VN");
  const { isLoggedIn } = useOutletContext<{ isLoggedIn: boolean }>();

  // Refs
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Suggestions State
  const [suggestions, setSuggestions] = useState<Idiom[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsListRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const searchQuery = searchParams.get("query");

  const {
    isListening,
    startListening,
    stopListening,
    abortListening,
    isSupported,
  } = useSpeechRecognition({
    lang: voiceLang,
    onResult: (text) => {
      setQuery(text);
      handleSearch(text);
    },
  });

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Handle Suggestions Fetching
  useEffect(() => {
    const fetchTimer = setTimeout(async () => {
      if (query.trim() && searchMode === "database" && !currentIdiom) {
        try {
          const results = await fetchSuggestions(query);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
          setSelectedIndex(-1);
        } catch (err) {
          console.error("Suggestions error:", err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(fetchTimer);
  }, [query, searchMode, currentIdiom]);

  // Handle Click Outside Suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Scroll to selected suggestion
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsListRef.current) {
      const selectedElement = suggestionsListRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const handleSearch = async (searchTerm: string, forceMode?: SearchMode) => {
    setShowSuggestions(false);
    if (!searchTerm.trim()) {
      setError(null);
      setCurrentIdiom(null);
      setSearchParams({});
      return;
    }
    setSearchParams({ query: searchTerm });
    const modeToUse = forceMode || searchMode;

    setIsLoading(true);
    setError(null);
    setCurrentIdiom(null);

    try {
      const result = await fetchIdiomDetails(searchTerm, modeToUse);
      setCurrentIdiom(result);
      if (result?.id && isLoggedIn) {
        addToHistory(result.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = () => {
    if (isLoading) return;
    if (searchQuery) {
      // Nếu có nội dung, nút đóng vai trò là CLEAR
      setQuery("");
      handleSearch("");
    } else {
      // Nếu không có nội dung, nút đóng vai trò là SEARCH (mặc dù disabled nếu empty)
    }
  };

  const handleChangeMode = (mode: string) => {
    setSearchMode(mode as SearchMode);
    setError(null);
    setShowSuggestions(false);
  };

  const isCenteredMode = !currentIdiom && !isLoading;

  if (currentIdiom) {
    const onBack = () => {
      setQuery("");
      handleSearch("");
    };

    return (
      <div className="w-full h-full flex flex-col items-center">
        {/* Navigation Bar for Detail View */}
        <div className="w-full max-w-6xl px-4 flex justify-start">
          <button
            onClick={onBack}
            className="group flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-red-100 transition-all active:scale-95"
            aria-label="Quay lại"
          >
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-red-600 transition-colors">
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-sm font-black text-slate-600 group-hover:text-slate-800 tracking-tight">
              Quay lại trang chủ
            </span>
          </button>
        </div>

        <div className="relative w-full animate-pop">
          {/* <div
            className={`absolute top-0 right-0 z-10 px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl text-[10px] font-bold text-white shadow-lg ${
              currentIdiom.dataSource === "ai"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                : "bg-slate-800"
            }`}
          >
            {currentIdiom.dataSource === "ai"
              ? "✨ PHÂN TÍCH BỞI AI"
              : "📚 DỮ LIỆU CHUẨN"}
          </div> */}
          <IdiomDetail
            idiom={currentIdiom}
            isLoggedIn={isLoggedIn}
            isPremium={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-full flex flex-col items-center transition-all duration-700 ${
        isCenteredMode ? "justify-center pb-20" : "justify-start pt-4"
      }`}
    >
      <div
        className={`w-full max-w-3xl transition-all duration-700 z-[1]${
          isCenteredMode ? "scale-105" : "mb-8"
        }`}
      >
        {isCenteredMode && (
          <div className="text-center mb-5 md:mb-8 animate-pop">
            <div className="relative inline-block mb-4 md:mb-6">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-[2rem] shadow-2xl rotate-3 transform transition-transform hover:rotate-0 overflow-hidden bg-white border border-slate-100">
                <img
                  src="/assets/app_icon.png"
                  alt="GYSpace Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-3xl md:text-6xl font-hanzi font-bold text-slate-800 mb-2 md:mb-4 tracking-tight">
              GYSpace
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-lg px-4 max-w-md mx-auto leading-relaxed">
              Từ điển Tra cứu & Học tập Quán dụng ngữ
            </p>
          </div>
        )}

        {/* <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-full border border-slate-200 shadow-sm flex items-center">
            <button
              onClick={() => handleChangeMode("database")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                searchMode === "database"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" /> Thư viện chuẩn
            </button>
            <button
              onClick={() => handleChangeMode("ai")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                searchMode === "ai"
                  ? "bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <BrainIcon className="w-3.5 h-3.5" /> Sức mạnh AI
            </button>
          </div>
        </div> */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative group"
          ref={searchContainerRef}
        >
          <div
            className={`absolute -inset-1 rounded-full blur opacity-20 transition duration-1000 ${
              searchMode === "ai" ? "bg-purple-600" : "bg-red-600"
            }`}
          ></div>
          <div className="relative flex items-center bg-white rounded-full shadow-xl border border-slate-100">
            <div className="relative flex-1 flex items-center overflow-hidden rounded-l-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (showSuggestions) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSelectedIndex((prev) =>
                        prev < suggestions.length - 1 ? prev + 1 : prev
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                    } else if (e.key === "Enter") {
                      if (selectedIndex >= 0) {
                        e.preventDefault();
                        const selected = suggestions[selectedIndex];
                        setQuery(selected.hanzi);
                        handleSearch(selected.hanzi);
                      }
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                    }
                  }
                }}
                placeholder={
                  searchMode === "database"
                    ? "Nhập Hán tự, Pinyin, nghĩa tiếng Việt..."
                    : "Hỏi AI bất cứ từ nào..."
                }
                className="w-full py-3 md:py-4 pl-4 md:pl-6 pr-4 text-base md:text-lg outline-none text-slate-700 font-medium bg-transparent"
              />

              {isListening && (
                <div className="absolute inset-0 bg-white z-10 flex items-center justify-between px-6 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 h-4 items-end">
                      <span className="w-1 h-2 bg-red-600 rounded-full animate-[bounce_1s_infinite_100ms]"></span>
                      <span className="w-1 h-3 bg-red-600 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                      <span className="w-1 h-4 bg-red-600 rounded-full animate-[bounce_1s_infinite_300ms]"></span>
                      <span className="w-1 h-2 bg-red-600 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                    </div>
                    <span className="text-slate-500 font-medium text-sm">
                      Đang nghe...
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={abortListening}
                    className="text-xs font-bold text-slate-400 hover:text-red-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hover:bg-white transition-all"
                  >
                    Hủy bỏ
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 pr-2">
              {isSupported && (
                <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 border border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setVoiceLang((prev) =>
                        prev === "vi-VN" ? "zh-CN" : "vi-VN"
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold text-slate-500 hover:bg-white hover:shadow-sm hover:text-red-500 transition-all font-mono"
                    title={voiceLang === "vi-VN" ? "Tiếng Việt" : "Tiếng Trung"}
                  >
                    {voiceLang === "vi-VN" ? "VI" : "CN"}
                  </button>
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                      isListening
                        ? "text-red-600 bg-red-100 opacity-0 pointer-events-none"
                        : "text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-sm"
                    }`}
                    title="Nhập bằng giọng nói"
                  >
                    <MicrophoneIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              <button
                type={searchQuery ? "button" : "submit"}
                className={`p-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center ${
                  searchQuery && !isLoading
                    ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    : "bg-red-700 text-white hover:bg-red-800"
                }`}
                onClick={handleActionClick}
                title={searchQuery ? "Xóa" : "Tìm kiếm"}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : searchQuery ? (
                  <CloseIcon className="w-6 h-6" />
                ) : (
                  <SearchIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300 z-[20]">
              <div
                ref={suggestionsListRef}
                className="p-2 space-y-1 max-h-[40vh] overflow-y-auto"
              >
                {suggestions.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setQuery(item.hanzi);
                      handleSearch(item.hanzi);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left ${
                      selectedIndex === index
                        ? "bg-slate-50 border-slate-100"
                        : "hover:bg-slate-50 border-transparent"
                    } border`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-hanzi font-bold text-slate-400">
                        {item.hanzi.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-hanzi font-bold text-slate-800">
                            {item.hanzi}
                          </span>
                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                            {item.pinyin}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {item.vietnameseMeaning}
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
              <div className="bg-slate-50 px-5 py-2 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Gợi ý thông minh
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <span>Di chuyển bằng</span>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200">
                      ↑
                    </span>
                    <span className="px-1.5 py-0.5 bg-white rounded border border-slate-200">
                      ↓
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {searchMode === "database" && (
          <p className="text-center text-slate-400 text-[10px] uppercase tracking-widest mt-4 font-bold">
            Hỗ trợ tìm kiếm bằng: Tiếng Việt, Pinyin, hoặc Chữ Hán
          </p>
        )}

        {/* {isCenteredMode && (
          <FeaturedComments
            onSearch={(t) => {
              setQuery(t);
              handleSearch(t, "database");
            }}
          />
        )} */}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center mt-12 text-slate-400 animate-pulse">
          <div
            className={`w-12 h-12 border-4 rounded-full border-t-transparent animate-spin mb-4 ${
              searchMode === "ai" ? "border-purple-600" : "border-red-600"
            }`}
          ></div>
          <p className="font-bold text-sm tracking-wide uppercase">
            {searchMode === "ai"
              ? "AI đang tư duy..."
              : "Đang lục lại thư viện..."}
          </p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto mt-8 bg-red-50 border border-red-100 p-8 rounded-2xl text-center animate-shake">
          <p className="text-red-600 mb-6 font-bold">{error}</p>
          {searchMode === "database" && (
            <button
              onClick={() => setSearchMode("ai")}
              className="px-8 py-3 bg-slate-800 text-white rounded-full text-xs font-bold hover:bg-black transition-all shadow-lg active:scale-95"
            >
              Tra cứu bằng AI ngay
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl px-4 animate-pop delay-100 mt-10">
          <button
            onClick={() => navigate("flashcards")}
            className="group relative bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-[2.5rem] text-left overflow-hidden shadow-2xl hover:shadow-red-200 hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <BrainIcon className="w-40 h-40 text-white" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                <CardIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                SRS Flashcard
              </h3>
              <p className="text-red-100 text-sm opacity-90 leading-relaxed">
                Ôn tập hiệu quả bằng thuật toán ghi nhớ thông minh nhất.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Đang mở ôn tập
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("word_search")}
            className="group relative bg-gradient-to-br from-indigo-600 to-sky-700 p-8 rounded-[2.5rem] text-left overflow-hidden shadow-2xl hover:shadow-indigo-200 hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <PuzzlePieceIcon className="w-40 h-40 text-white" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                <PuzzlePieceIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Game Tìm Chữ
              </h3>
              <p className="text-sky-100 text-sm opacity-90 leading-relaxed">
                Thử thách nhãn quan và ghi nhớ từ vựng qua trò chơi.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                Thử thách tuần
              </div>
            </div>
          </button>
        </div>
      )}

      <HandwritingPad
        isOpen={isHandwritingPadOpen}
        onClose={() => setIsHandwritingPadOpen(false)}
        onCharacterSelect={(c) => setQuery((p) => p + c)}
      />
    </div>
  );
};

export default Home;
