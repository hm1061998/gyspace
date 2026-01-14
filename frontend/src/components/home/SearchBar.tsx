import React, { RefObject } from "react";
import {
  SearchIcon,
  CloseIcon,
  MicrophoneIcon,
  ArrowLeftIcon,
} from "@/components/common/icons";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (searchTerm: string) => void;
  isLoading: boolean;
  isListening: boolean;
  isSupported: boolean;
  voiceLang: "vi-VN" | "zh-CN";
  setVoiceLang: React.Dispatch<React.SetStateAction<"vi-VN" | "zh-CN">>;
  startListening: () => void;
  stopListening: () => void;
  abortListening: () => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  searchContainerRef: RefObject<HTMLDivElement | null>;
  children?: React.ReactNode; // For suggestions dropdown
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onSearch,
  isLoading,
  isListening,
  isSupported,
  voiceLang,
  setVoiceLang,
  startListening,
  stopListening,
  abortListening,
  onFocus,
  onKeyDown,
  searchContainerRef,
  children,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(query);
      }}
      className="relative group transition-all duration-300"
      ref={searchContainerRef}
    >
      <div
        className={`absolute -inset-1 rounded-full blur opacity-20 transition duration-1000 bg-red-600`}
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
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            placeholder={"Hán tự, Pinyin, nghĩa Việt..."}
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
                onSearch("");
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
                  setVoiceLang((prev) => (prev === "vi-VN" ? "zh-CN" : "vi-VN"))
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
            className={`ml-1 px-6 md:px-8 py-3 md:py-4 rounded-[1.5rem] transition-all shadow-[0_10px_20px_rgba(239,68,68,0.2)] active:scale-95 flex items-center justify-center gap-2 font-bold text-sm md:text-base bg-red-600 text-white hover:bg-red-700 hover:shadow-red-200`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <>
                <span>Tra cứu</span>
                <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>
      {children}
    </form>
  );
};

export default SearchBar;
