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
import DailySuggestions from "@/components/idiom/DailySuggestions";
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

  const executeSearch = async (searchTerm: string, modeToUse: SearchMode) => {
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

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      executeSearch(searchQuery, searchMode);
      setShowSuggestions(false);
    } else {
      // Clear state when query is removed from URL
      setCurrentIdiom(null);
      setError(null);
    }
  }, [searchQuery, searchMode]); // Re-run if query or mode changes

  // Handle Suggestions Fetching
  useEffect(() => {
    const fetchTimer = setTimeout(async () => {
      if (query.trim() && searchMode === "database" && !currentIdiom) {
        try {
          const { data } = await fetchSuggestions(query);
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
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

  const handleSearch = (searchTerm: string) => {
    setShowSuggestions(false);
    if (!searchTerm.trim()) {
      setSearchParams({});
      return;
    }
    // Update URL, which will trigger the effect
    setSearchParams({ query: searchTerm });
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
      className={`w-full flex flex-col items-center transition-all duration-700 ${
        isCenteredMode
          ? "pt-5 justify-center overflow-hidden pb-10"
          : "min-h-full justify-start pt-4"
      }`}
    >
      <div
        className={`w-full max-w-3xl transition-all duration-700 z-[1] ${
          isCenteredMode ? "scale-100" : "mb-8 scale-100"
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative group transition-all duration-300"
          ref={searchContainerRef}
        >
          <div
            className={`absolute -inset-1 rounded-full blur opacity-20 transition duration-1000 ${
              searchMode === "ai" ? "bg-purple-600" : "bg-red-600"
            }`}
          ></div>
          <div className="relative flex items-center bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white transition-all duration-300 group-focus-within:shadow-[0_20px_60px_rgba(239,68,68,0.15)] group-focus-within:border-red-100 group-focus-within:-translate-y-1">
            <div className="relative flex-1 flex items-center overflow-hidden rounded-l-[2rem]">
              <div className="pl-6 text-slate-400 group-focus-within:text-red-500 transition-colors">
                <SearchIcon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
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
                    ? "Hán tự, Pinyin, nghĩa Việt..."
                    : "Hỏi AI bất cứ từ nào..."
                }
                className="w-full py-4 md:py-6 pl-4 md:pl-5 pr-4 text-base md:text-xl outline-none text-slate-800 font-semibold bg-transparent placeholder:text-slate-300 placeholder:font-medium"
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

            <div className="flex items-center gap-2 pr-3">
              {query && !isLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    handleSearch("");
                  }}
                  className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              )}
              {isSupported && (
                <div className="hidden sm:flex items-center gap-1 bg-slate-50/50 backdrop-blur-sm rounded-2xl p-1 border border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setVoiceLang((prev) =>
                        prev === "vi-VN" ? "zh-CN" : "vi-VN"
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-[10px] font-black text-slate-500 hover:bg-white hover:shadow-sm hover:text-red-500 transition-all font-mono"
                    title={voiceLang === "vi-VN" ? "Tiếng Việt" : "Tiếng Trung"}
                  >
                    {voiceLang === "vi-VN" ? "VI" : "CN"}
                  </button>
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                      isListening
                        ? "text-red-600 bg-red-100 scale-110"
                        : "text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-sm"
                    }`}
                    title="Nhập bằng giọng nói"
                  >
                    <MicrophoneIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`ml-1 px-6 md:px-8 py-3 md:py-4 rounded-[1.5rem] transition-all shadow-[0_10px_20px_rgba(239,68,68,0.2)] active:scale-95 flex items-center justify-center gap-2 font-bold text-sm md:text-base ${
                  searchMode === "ai"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-200"
                    : "bg-red-600 text-white hover:bg-red-700 hover:shadow-red-200"
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    <span>{searchMode === "ai" ? "Hỏi AI" : "Tra cứu"}</span>
                    <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-white overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-500">
              <div
                ref={suggestionsListRef}
                className="p-3 space-y-1.5 max-h-[40vh] overflow-y-auto scrollbar-hide"
              >
                {suggestions.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setQuery(item.hanzi);
                      handleSearch(item.hanzi);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all duration-200 group/item ${
                      selectedIndex === index
                        ? "bg-red-50 scale-[1.02] shadow-sm"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-hanzi font-bold text-xl transition-all duration-300 ${
                          selectedIndex === index
                            ? "bg-red-600 text-white rotate-6 shadow-lg shadow-red-200"
                            : "bg-slate-100 text-slate-400 group-hover/item:bg-white group-hover/item:text-slate-600"
                        }`}
                      >
                        {item.hanzi.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-hanzi font-black text-slate-800 text-lg">
                            {item.hanzi}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              selectedIndex === index
                                ? "bg-red-100 text-red-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.pinyin}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 font-medium line-clamp-1 group-hover/item:text-slate-500 transition-colors">
                          {item.vietnameseMeaning}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        selectedIndex === index
                          ? "bg-white text-red-600 shadow-sm translate-x-1"
                          : "text-slate-200 group-hover/item:text-slate-400"
                      }`}
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="bg-slate-50/50 backdrop-blur-md px-6 py-3 flex items-center justify-between border-t border-slate-100/50">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Gợi ý thông minh
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-5 h-5 bg-white rounded-md border border-slate-200 shadow-sm">
                      ↑↓
                    </span>
                    <span>Di chuyển</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center justify-center px-1.5 h-5 bg-white rounded-md border border-slate-200 shadow-sm capitalize">
                      Enter
                    </span>
                    <span>Chọn</span>
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

        {isCenteredMode && (
          <div className="mt-8">
            <DailySuggestions
              onSelect={(text) => {
                setQuery(text);
                handleSearch(text);
              }}
            />
          </div>
        )}
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
          <p className="text-red-600 font-bold">{error}</p>
          {/* {searchMode === "database" && (
            <button
              onClick={() => setSearchMode("ai")}
              className="mt-6 px-8 py-3 bg-slate-800 text-white rounded-full text-xs font-bold hover:bg-black transition-all shadow-lg active:scale-95"
            >
              Tra cứu bằng AI ngay
            </button>
          )} */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl px-4 animate-pop delay-100 mt-3">
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
                Ôn tập Flashcard
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
    </div>
  );
};

export default Home;
