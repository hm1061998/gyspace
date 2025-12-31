import React, { useState, useEffect } from "react";
import type { Idiom } from "../types";
import WritingGrid from "./WritingGrid";
import {
  BookmarkIcon,
  CardIcon,
  VideoIcon,
  RefreshIcon,
  PencilIcon,
  SpeakerWaveIcon,
  SpinnerIcon,
} from "./icons";
import IdiomComments from "./IdiomComments";
import { toast } from "@/services/toastService";
import {
  checkSavedStatus,
  fetchSavedIdioms,
  toggleSaveIdiom,
  updateSRSProgress,
} from "@/services/userDataService";

interface IdiomDetailProps {
  idiom: Idiom;
  isLoggedIn: boolean; // Added prop
  isPremium: boolean; // Added prop
}

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, children, className, style }) => (
  <div className={`mb-6 md:mb-8 ${className || ""}`} style={style}>
    <h3 className="font-hanzi text-lg md:text-xl font-bold text-red-700 border-b border-red-200 pb-2 mb-3 md:mb-4">
      {title}
    </h3>
    <div className="text-slate-700 leading-relaxed text-sm md:text-base">
      {children}
    </div>
  </div>
);

const getTypeColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("thành ngữ")) return "bg-red-100 text-red-800 border-red-200";
  if (t.includes("lóng") || t.includes("mạng"))
    return "bg-purple-100 text-purple-800 border-purple-200";
  if (t.includes("quán dụng"))
    return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
};

const IdiomDetail: React.FC<IdiomDetailProps> = ({
  idiom,
  isLoggedIn,
  isPremium,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isLoggedIn && idiom.id) {
      checkStatus();
    } else {
      setIsSaved(false);
    }
  }, [idiom.id, isLoggedIn]);

  const checkStatus = async () => {
    if (!idiom.id) return;
    const saved = await checkSavedStatus(idiom.id);
    setIsSaved(saved);
  };

  const handleToggleSave = async () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để lưu từ.");
      return;
    }

    if (!idiom.id) {
      toast.info(
        "Không thể lưu từ chưa có trong hệ thống. Hãy thử tìm từ khác hoặc liên hệ admin."
      );
      return;
    }

    setIsSyncing(true);
    try {
      const result = await toggleSaveIdiom(idiom.id);
      setIsSaved(result.saved);
      if (result.saved) {
        toast.success(`Đã lưu "${idiom.hanzi}" vào thư viện cá nhân!`);
      } else {
        toast.info(`Đã bỏ lưu "${idiom.hanzi}"`);
      }
    } catch (e) {
      toast.error("Lỗi đồng bộ dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop previous utterance
      const utterance = new SpeechSynthesisUtterance(idiom.hanzi);
      utterance.lang = "zh-CN";
      utterance.rate = 0.8;

      // Attempt to pick a Chinese voice
      const voices = window.speechSynthesis.getVoices();
      const chineseVoice = voices.find(
        (v) => v.lang.includes("zh") || v.lang.includes("CN")
      );
      if (chineseVoice) utterance.voice = chineseVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Trình duyệt không hỗ trợ đọc văn bản.");
    }
  };

  const handleAddToFlashcard = async () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này.");
      return;
    }
    if (isSaved) {
      toast.info("Từ này đã có trong bộ thẻ ghi nhớ của bạn rồi!");
      return;
    }
    // Nếu chưa lưu thì lưu lại
    await handleToggleSave();
  };

  const handleStudyAgain = async () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này.");
      return;
    }
    if (!idiom.id) return;

    try {
      // Reset về trạng thái mới: interval=0, repetition=0, ef=2.5, nextReview=now
      await updateSRSProgress(idiom.id, {
        interval: 0,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: Date.now().toString(),
      });
      toast.success(
        "Đã cài đặt lại tiến độ. Từ này sẽ xuất hiện ngay trong bài ôn tập tới!"
      );
    } catch (e) {
      toast.error("Không thể cập nhật tiến độ học.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-[fadeInUp_0.4s_ease-out]">
      {/* Header Section */}
      <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-hanzi font-bold text-slate-800 tracking-wide">
                {idiom.hanzi}
              </h1>
              {/* <span
                className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(
                  idiom.type
                )}`}
              >
                {idiom.type}
              </span> */}
            </div>
            {/* Main Pinyin Display & Speak Button */}
            <div className="flex items-center gap-2">
              {/* Modified for Pinyin clarity: font-sans, wider tracking */}
              <p className="text-xl md:text-2xl text-red-600 font-medium font-sans tracking-wider">
                {idiom.pinyin}
              </p>
              <button
                onClick={handleSpeak}
                className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Nghe phát âm"
              >
                <SpeakerWaveIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleToggleSave}
              disabled={isSyncing}
              className={`p-3 rounded-xl border shadow-sm transition-all group ${
                isSaved
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-slate-200 text-slate-400 hover:text-red-500"
              }`}
            >
              {isSyncing ? (
                <SpinnerIcon className="w-6 h-6" />
              ) : (
                <BookmarkIcon
                  className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`}
                />
              )}
            </button>
          </div>
        </div>

        {(idiom.literalMeaning || idiom.figurativeMeaning) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-slate-500 text-sm uppercase tracking-wider mb-1 font-semibold">
                Nghĩa đen
              </h3>
              <p className="text-slate-800 font-medium text-lg">
                {idiom.literalMeaning}
              </p>
            </div>
            <div>
              <h3 className="text-slate-500 text-sm uppercase tracking-wider mb-1 font-semibold">
                Nghĩa bóng / Thực tế
              </h3>
              <p className="text-slate-800 font-medium text-lg">
                {idiom.figurativeMeaning}
              </p>
            </div>
          </div>
        )}

        {/* Usage Context Badge if available */}
        {idiom.usageContext && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500 mr-2 font-semibold">
              Ngữ cảnh:
            </span>
            <span className="text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded-md">
              {idiom.usageContext}
            </span>
          </div>
        )}

        {/* Vietnamese Meaning (Translation) */}
        <div className="mt-3">
          <span className="text-sm text-slate-500 mr-2 font-semibold">
            Nghĩa tiếng Việt:
          </span>
          <span className="text-lg font-bold text-slate-800">
            {idiom.vietnameseMeaning}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-sm text-slate-500 mr-2 font-semibold">
            Nghĩa tiếng Trung:
          </span>
          <span className="text-lg font-bold text-slate-800">
            {idiom.chineseDefinition}
          </span>
        </div>

        {idiom.imageUrl && (
          <div className="mt-6 w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm relative group">
            <img
              src={idiom.imageUrl}
              alt={`Minh họa cho ${idiom.hanzi}`}
              className="w-full h-auto object-cover max-h-[300px] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs text-center">
                Hình ảnh minh họa
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Analysis & Origin */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            {idiom.analysis?.length > 0 && (
              <Section title="Phân tích chi tiết">
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {idiom.analysis.map((char, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center group"
                    >
                      <WritingGrid character={char.character} />
                      <div className="mt-2 text-center">
                        {/* Character Pinyin: font-sans for better tone mark rendering, wide tracking */}
                        <p className="text-red-600 font-semibold text-base font-sans tracking-wide">
                          {char.pinyin}
                        </p>
                        <p className="text-slate-600 text-xs mt-0.5 max-w-[80px] truncate">
                          {char.meaning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Nguồn gốc & Điển tích">
              <p>{idiom.origin}</p>
            </Section>

            <Section title="Cách dùng & Ngữ pháp">
              <p>{idiom.grammar}</p>
            </Section>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <Section title="Ví dụ minh họa" className="mb-0">
              <div className="space-y-4">
                {idiom.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-amber-200 transition-colors"
                  >
                    <p className="text-lg font-hanzi text-slate-800 mb-2">
                      {ex.chinese}
                    </p>
                    {/* Example Pinyin: font-sans, tracking-wide, leading-loose (more vertical space) for perfect tone display */}
                    <p className="text-base text-slate-600 mb-2 font-sans tracking-wide leading-loose">
                      {ex.pinyin}
                    </p>
                    <p className="text-slate-700 border-l-2 border-red-400 pl-3">
                      {ex.vietnamese}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* Right Column: Actions & Comments */}
        <div className="space-y-6">
          {/* Action Cards */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <VideoIcon className="w-5 h-5 mr-2 text-amber-500" />
              Góc học tập
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleAddToFlashcard}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md active:scale-95 group"
              >
                <CardIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Thêm vào Flashcard</span>
              </button>

              <button
                onClick={handleStudyAgain}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-white border-2 border-amber-400 text-amber-600 rounded-lg hover:bg-amber-50 transition-all shadow-sm active:scale-95 group"
              >
                <RefreshIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Học lại</span>
              </button>

              <button
                disabled={!idiom.videoUrl}
                className={`w-full py-3 bg-slate-100 text-slate-600 rounded-lg transition-colors text-sm ${
                  !idiom.videoUrl
                    ? "opacity-50 cursor-not-allowed disabled"
                    : "hover:bg-slate-200"
                }`}
              >
                <a
                  href={idiom.videoUrl ? idiom.videoUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-full`}
                >
                  {`Xem video giải thích ${idiom.videoUrl ? "" : "(Sắp có)"}`}
                </a>
              </button>
            </div>
          </div>

          {/* Personal Notes Section */}
          {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <PencilIcon className="w-5 h-5 mr-2 text-blue-500" />
              Ghi chú của bạn
            </h3>

            {!isLoggedIn ? (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500 text-sm">
                  Đăng nhập để tạo ghi chú riêng cho từ này.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Viết ghi chú cá nhân tại đây (ví dụ: cách nhớ, bối cảnh đã gặp...)"
                  className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none transition-all placeholder-slate-400"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!userNote.trim()}
                  >
                    Lưu ghi chú
                  </button>
                </div>
              </div>
            )}
          </div> */}

          {/* Comments Section */}
          {/* <IdiomComments
            idiomHanzi={idiom.hanzi}
            isLoggedIn={isLoggedIn}
            isPremium={isPremium}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default IdiomDetail;
