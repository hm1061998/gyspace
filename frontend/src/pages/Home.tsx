import React, { useState, useEffect, useRef } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import IdiomDetail from "@/components/idiom/IdiomDetail";
import DailySuggestions from "@/components/idiom/DailySuggestions";
import { ArrowLeftIcon } from "@/components/common/icons";
import SearchBar from "@/components/home/SearchBar";
import SearchSuggestions from "@/components/home/SearchSuggestions";
import HomeActionCards from "@/components/home/HomeActionCards";
import { useIdiomSearch } from "@/hooks/useIdiomSearch";
import { useSuggestions } from "@/hooks/useSuggestions";
import ReportModal from "@/components/idiom/ReportModal";

const Home: React.FC = () => {
  const {
    query,
    setQuery,
    currentIdiom,
    isLoading,
    error,
    handleSearch,
    isLoggedIn,
  } = useIdiomSearch();

  const {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    suggestionsListRef,
    handleKeyDown,
  } = useSuggestions(query, !!currentIdiom);

  const [voiceLang, setVoiceLang] = useState<"vi-VN" | "zh-CN">("vi-VN");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
  }, [setShowSuggestions]);

  const isCenteredMode = !currentIdiom && !isLoading;

  if (currentIdiom) {
    return (
      <div className="w-full h-full flex flex-col items-center">
        <div className="w-full max-w-6xl px-4 flex justify-start">
          <button
            onClick={() => handleSearch("")}
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
          <IdiomDetail
            idiom={currentIdiom}
            isLoggedIn={isLoggedIn}
            isPremium={true}
            onClickReport={() => setIsReportModalOpen(true)}
          />
        </div>

        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          idiomId={currentIdiom.id || ""}
          idiomHanzi={currentIdiom.hanzi}
        />
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
        className={`w-full max-w-3xl transition-all duration-700 z-1 ${
          isCenteredMode ? "scale-100" : "mb-8 scale-100"
        }`}
      >
        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          isLoading={isLoading}
          isListening={isListening}
          isSupported={isSupported}
          voiceLang={voiceLang}
          setVoiceLang={setVoiceLang}
          startListening={startListening}
          stopListening={stopListening}
          abortListening={abortListening}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={(e) =>
            handleKeyDown(e, (val) => {
              setQuery(val);
              handleSearch(val);
            })
          }
          searchContainerRef={searchContainerRef}
        >
          {showSuggestions && (
            <SearchSuggestions
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              onSelect={(item) => {
                setQuery(item.hanzi);
                handleSearch(item.hanzi);
              }}
              listRef={suggestionsListRef}
            />
          )}
        </SearchBar>

        <p className="text-center text-slate-400 text-[10px] uppercase tracking-widest mt-4 font-bold">
          Hỗ trợ tìm kiếm bằng: Tiếng Việt, Pinyin, hoặc Chữ Hán
        </p>

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
          <div className="w-12 h-12 border-4 rounded-full border-t-transparent animate-spin mb-4 border-red-600"></div>
          <p className="font-bold text-sm tracking-wide uppercase">
            Đang lục lại thư viện...
          </p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto mt-8 bg-red-50 border border-red-100 p-8 rounded-2xl text-center animate-shake">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      ) : (
        <HomeActionCards isLoggedIn={isLoggedIn} />
      )}
    </div>
  );
};

export default Home;
