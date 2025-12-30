import React, { useState, useEffect } from "react";
import type { Idiom } from "../types";
import WritingGrid from "./WritingGrid";
import { BookmarkIcon, CardIcon, SpeakerWaveIcon, BrainIcon } from "./icons";
import IdiomComments from "./IdiomComments";

interface IdiomDetailProps {
  idiom: Idiom & { dataSource?: string };
  isLoggedIn: boolean;
  isPremium: boolean;
}

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <div className={`mb-6 md:mb-8 ${className || ""}`}>
    <h3 className="font-hanzi text-lg md:text-xl font-bold text-red-700 border-b border-red-200 pb-2 mb-3 md:mb-4">
      {title}
    </h3>
    <div className="text-slate-700 leading-relaxed text-sm md:text-base">
      {children}
    </div>
  </div>
);

const IdiomDetail: React.FC<IdiomDetailProps> = ({
  idiom,
  isLoggedIn,
  isPremium,
}) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const safeGetStorage = (key: string) => {
    try {
      const data = localStorage.getItem("saved_words");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const savedList = safeGetStorage("saved_words");
    setIsSaved(savedList.some((item: any) => item.hanzi === idiom.hanzi));
  }, [idiom]);

  const handleToggleSave = () => {
    if (!isLoggedIn) {
      setToastMessage("Vui lòng đăng nhập để lưu từ.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    const savedList = safeGetStorage("saved_words");
    const newList = isSaved
      ? savedList.filter((item: any) => item.hanzi !== idiom.hanzi)
      : [idiom, ...savedList];
    localStorage.setItem("saved_words", JSON.stringify(newList));
    setIsSaved(!isSaved);
    setToastMessage(isSaved ? "Đã bỏ lưu." : "Đã lưu thành công!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {showToast && (
        <div className="fixed top-24 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pop">
          {toastMessage}
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-700"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-6xl font-hanzi font-bold text-slate-800 tracking-tight">
                {idiom.hanzi}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700 font-bold uppercase">
                  {idiom.type}
                </span>
                {idiom.level && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                      idiom.level === "Cao cấp"
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                  >
                    {idiom.level}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xl md:text-2xl text-red-600 font-medium font-sans tracking-wide">
                {idiom.pinyin}
              </p>
              <button
                onClick={() => {
                  const u = new SpeechSynthesisUtterance(idiom.hanzi);
                  u.lang = "zh-CN";
                  u.rate = 0.8;
                  window.speechSynthesis.speak(u);
                }}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <SpeakerWaveIcon className="w-5 h-5" />
              </button>
            </div>
            {idiom.source && (
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                Nguồn: {idiom.source}
              </p>
            )}
          </div>

          <button
            onClick={handleToggleSave}
            className={`p-3 rounded-xl border shadow-sm transition-all group ${
              isSaved
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-white border-slate-200 text-slate-400 hover:text-red-500"
            }`}
          >
            <BookmarkIcon
              className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
            <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">
              Nghĩa tiếng Việt
            </h3>
            <p className="text-slate-800 font-medium text-lg leading-relaxed">
              {idiom.vietnameseMeaning}
            </p>
          </div>
          <div className="bg-amber-50/30 p-5 rounded-xl border border-amber-100/50">
            <h3 className="text-amber-600 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">
              Ý nghĩa/Nghĩa bóng
            </h3>
            <p className="text-slate-800 font-medium text-lg leading-relaxed">
              {idiom.figurativeMeaning}
            </p>
          </div>
        </div>

        {idiom.chineseDefinition && (
          <div className="mb-6 p-5 bg-slate-800 rounded-xl text-white">
            <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">
              Nghĩa tiếng Trung (释义)
            </h3>
            <p className="font-hanzi text-lg leading-relaxed">
              {idiom.chineseDefinition}
            </p>
          </div>
        )}

        {idiom.literalMeaning && (
          <div className="p-5 bg-red-50/30 rounded-xl border border-red-100/50 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0">
              Nghĩa đen
            </span>
            <span className="text-lg font-medium text-red-800">
              {idiom.literalMeaning}
            </span>
          </div>
        )}

        {idiom.imageUrl && (
          <div className="mt-8 rounded-2xl overflow-hidden border border-slate-100 shadow-md relative group max-h-[400px]">
            <img
              src={idiom.imageUrl}
              alt={idiom.hanzi}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {idiom.analysis && idiom.analysis.length > 0 && (
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200">
              <Section title="Phân tích Hán tự">
                <div className="flex flex-wrap gap-6 justify-center md:justify-start pt-2">
                  {idiom.analysis.map((char, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center group"
                    >
                      <WritingGrid character={char.character} />
                      <div className="mt-3 text-center">
                        <p className="text-red-600 font-bold text-lg font-sans">
                          {char.pinyin}
                        </p>
                        <p className="text-slate-500 text-sm font-medium">
                          {char.meaning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200">
            <Section title="Nguồn gốc">
              <p className="text-slate-600 italic">
                "{idiom.origin || "Đang cập nhật..."}"
              </p>
            </Section>

            <Section title="Cách dùng & Ngữ pháp">
              <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-300 text-slate-700">
                {idiom.grammar || "Cần chú ý ngữ cảnh sử dụng."}
              </div>
            </Section>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200">
            <Section title="Ví dụ minh họa" className="mb-0">
              <div className="space-y-6">
                {idiom.examples && idiom.examples.length > 0 ? (
                  idiom.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-red-200 hover:shadow-md transition-all"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 group-hover:bg-red-50 group-hover:text-red-500">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-xl font-hanzi text-slate-800 mb-2 leading-relaxed">
                            {ex.chinese}
                          </p>
                          <p className="text-base text-red-500/80 mb-3 font-sans italic">
                            {ex.pinyin}
                          </p>
                          <p className="text-slate-600 font-medium pl-4 border-l-2 border-slate-200">
                            {ex.vietnamese}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">
                    Chưa có ví dụ minh họa.
                  </p>
                )}
              </div>
            </Section>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center uppercase text-xs tracking-widest text-slate-400">
              Công cụ học tập
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-3 py-4 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-all shadow-lg shadow-red-100 active:scale-95 group">
                <CardIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="font-bold">Học Flashcard</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-3 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-amber-400 hover:text-amber-600 transition-all active:scale-95 group">
                <BrainIcon className="w-5 h-5" />
                <span className="font-bold">Kiểm tra AI</span>
              </button>
            </div>
          </div>
          <IdiomComments
            idiomHanzi={idiom.hanzi}
            isLoggedIn={isLoggedIn}
            isPremium={isPremium}
          />
        </div>
      </div>
    </div>
  );
};

export default IdiomDetail;
