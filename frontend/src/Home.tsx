import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchIdiomDetails } from "../services/idiomService";
import type { Idiom, SearchMode } from "../types";
import IdiomDetail from "../components/IdiomDetail";
import HandwritingPad from "../components/HandwritingPad";
import FeaturedComments from "../components/FeaturedComments";
import {
  SearchIcon,
  HistoryIcon,
  PencilIcon,
  SpinnerIcon,
  BrainIcon,
  CloseIcon,
} from "../components/icons";

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState<string>("");
  const [currentIdiom, setCurrentIdiom] = useState<
    (Idiom & { dataSource: string }) | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>("database");
  const [isHandwritingPadOpen, setIsHandwritingPadOpen] = useState(false);

  const searchQuery = searchParams.get("query");

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleSearch = async (searchTerm: string, forceMode?: SearchMode) => {
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
    setSearchMode(mode);
    setError(null);
  };

  const isCenteredMode = !currentIdiom && !isLoading;

  return (
    <div
      className={`w-full h-full flex flex-col flex-1 items-center ${
        isCenteredMode ? "justify-center -mt-16 h-svh" : "pt-4"
      }`}
    >
      <div
        className={`w-full max-w-3xl transition-all duration-700 ${
          isCenteredMode ? "scale-105" : "mb-8"
        }`}
      >
        {isCenteredMode && (
          <div className="text-center mb-8 animate-pop">
            <h1 className="text-4xl md:text-5xl font-hanzi font-bold text-slate-800 mb-4 tracking-tight">
              Tra cứu <span className="text-red-600">Hán ngữ</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Thành ngữ, quán dụng ngữ & tiếng lóng mới nhất
            </p>
          </div>
        )}

        <div className="flex justify-center mb-6">
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
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative group"
        >
          <div
            className={`absolute -inset-1 rounded-full blur opacity-20 transition duration-1000 ${
              searchMode === "ai" ? "bg-purple-600" : "bg-red-600"
            }`}
          ></div>
          <div className="relative flex items-center bg-white rounded-full shadow-xl border border-slate-100 overflow-hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchMode === "database"
                  ? "Nhập Hán tự, Pinyin, nghĩa tiếng Việt..."
                  : "Hỏi AI bất cứ từ nào..."
              }
              className="w-full py-4 px-6 text-lg outline-none text-slate-700 font-medium"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {/* <button
                type="button"
                onClick={() => setIsHandwritingPadOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
              </button> */}
              <button
                type={searchQuery ? "button" : "submit"}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all shadow-md active:scale-95 ${
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

      {isLoading && (
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
      )}

      {error && (
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
      )}

      {!isLoading && currentIdiom && (
        <div className="relative mt-4 animate-pop">
          <div
            className={`absolute top-0 right-0 z-10 px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl text-[10px] font-bold text-white shadow-lg ${
              currentIdiom.dataSource === "ai"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                : "bg-slate-800"
            }`}
          >
            {currentIdiom.dataSource === "ai"
              ? "✨ PHÂN TÍCH BỞI AI"
              : "📚 DỮ LIỆU CHUẨN"}
          </div>
          <IdiomDetail
            idiom={currentIdiom}
            isLoggedIn={true}
            isPremium={true}
          />
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
