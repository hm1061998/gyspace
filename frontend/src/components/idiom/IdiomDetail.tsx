import React, { useState, useEffect } from "react";
import type { Idiom } from "@/types";
import WritingGrid from "@/components/common/WritingGrid";
import {
  BookmarkIcon,
  CardIcon,
  VideoIcon,
  RefreshIcon,
  PencilIcon,
  SpeakerWaveIcon,
  SpinnerIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ChatBubbleIcon,
} from "@/components/common/icons";
import Container from "@/components/common/Container";
import SpeakButton from "@/components/common/SpeakButton";
import IdiomComments from "./IdiomComments";
import { toast } from "@/libs/Toast";
import {
  checkSavedStatus,
  toggleSaveIdiom,
  updateSRSProgress,
} from "@/services/api/userDataService";
import { loadingService } from "@/libs/Loading";

interface IdiomDetailProps {
  idiom: Idiom;
  isLoggedIn: boolean;
  isPremium: boolean;
}

const InfoCard: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className }) => (
  <div
    className={`bg-white rounded-3xl md:rounded-4xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${
      className || ""
    }`}
  >
    <div className="flex items-center gap-3 mb-4 md:mb-6">
      {icon && (
        <div className="p-2 bg-red-50 rounded-xl text-red-600 shrink-0">
          {React.cloneElement(icon as React.ReactElement, {
            className: "w-5 h-5 md:w-6 md:h-6",
          })}
        </div>
      )}
      <h3 className="text-lg md:text-xl font-hanzi font-black text-slate-800 tracking-tight">
        {title}
      </h3>
    </div>
    <div className="text-slate-600 leading-relaxed text-sm md:text-[15px] font-medium">
      {children}
    </div>
  </div>
);

const IdiomDetail: React.FC<IdiomDetailProps> = ({
  idiom,
  isLoggedIn,
  isPremium,
  onClickReport,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [learningTip, setLearningTip] = useState("");

  const learningTips = [
    "Học đi đôi với hành.",
    "Có công mài sắt, có ngày nên kim.",
    "Học một biết mười.",
    "Muốn biết phải hỏi, muốn giỏi phải học.",
    "Học tập là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc.",
    "Tri thức là sức mạnh.",
    "Kỉ luật là cầu nối giữa mục tiêu và thành tựu.",
    "Thành công không phải là chìa khóa mở cửa hạnh phúc.",
    "Đam mê là nguồn động lực lớn nhất của sự sáng tạo.",
    "Bắt đầu từ nơi bạn đứng. Sử dụng những gì bạn có. Làm những gì bạn có thể.",
  ];

  useEffect(() => {
    const randomTip =
      learningTips[Math.floor(Math.random() * learningTips.length)];
    setLearningTip(randomTip);
  }, [idiom.id]);

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
      toast.info("Không thể lưu từ chưa có trong hệ thống.");
      return;
    }

    setIsSyncing(true);
    try {
      const result = await toggleSaveIdiom(idiom.id);
      setIsSaved(result.saved);
      if (result.saved) {
        toast.success(`Đã lưu "${idiom.hanzi}" vào Sổ tay cá nhân!`);
      } else {
        toast.info(`Đã bỏ lưu "${idiom.hanzi}"`);
      }
    } catch (e) {
      toast.error("Lỗi đồng bộ dữ liệu.");
    } finally {
      setIsSyncing(false);
    }
  };

  const [grammarAnswers, setGrammarAnswers] = useState<string[]>([]);
  const [grammarChecked, setGrammarChecked] = useState(false);
  const [isGrammarCorrect, setIsGrammarCorrect] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (idiom.hanzi) {
      setGrammarAnswers(new Array(idiom.hanzi.length).fill(""));
      setGrammarChecked(false);
      setIsGrammarCorrect(null);
    }
  }, [idiom.id, idiom.hanzi]);

  const checkGrammarResult = () => {
    const isCorrect = grammarAnswers.join("") === idiom.hanzi;
    setIsGrammarCorrect(isCorrect);
    setGrammarChecked(true);
    if (isCorrect) {
      toast.success("Chính xác! Bạn giỏi quá!");
    } else {
      toast.error("Chưa đúng rồi, thử lại nhé!");
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
    await handleToggleSave();
  };

  const handleStudyAgain = async () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này.");
      return;
    }
    if (!idiom.id) return;

    loadingService.show("Đang cài đặt lại tiến độ...");
    try {
      await updateSRSProgress(idiom.id, {
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: Date.now().toString(),
      });
      toast.success("Đã cài đặt lại tiến độ học tập!");
    } catch (e) {
      toast.error("Không thể cập nhật tiến độ học.");
    } finally {
      loadingService.hide();
    }
  };

  const scrollToComments = () => {
    const section = document.getElementById("discussion-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Container className="pb-8 md:pb-12 animate-[fadeInUp_0.4s_ease-out]">
      {/* Hero Header Section */}
      <div className="relative mb-5 md:mb-8 group mt-3 md:mt-5">
        {/* Background Decor */}
        <div className="absolute -top-10 -left-10 w-48 md:w-64 h-48 md:h-64 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors duration-700"></div>
        <div className="absolute -bottom-10 -right-10 w-64 md:w-96 h-64 md:h-96 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>

        <div className="relative bg-white/70 backdrop-blur-2xl rounded-2xl md:rounded-4xl p-5 md:p-8 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            {/* Hanzi Visual */}
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center justify-between md:justify-start gap-4">
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-hanzi font-black text-slate-800 tracking-tighter drop-shadow-sm leading-tight">
                  {idiom.hanzi}
                </h1>
                <SpeakButton
                  text={idiom.hanzi}
                  lang="zh-CN"
                  className="w-12 h-12 md:w-14 md:h-14 p-0!"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <p className="text-2xl md:text-4xl text-red-600 font-black font-sans tracking-widest bg-red-50 px-3 md:px-4 py-1 rounded-xl md:rounded-2xl border border-red-100/50 w-fit">
                  {idiom.pinyin}
                </p>
                {/* <div className="h-6 w-px bg-slate-200 hidden sm:block"></div> */}
              </div>

              {idiom.usageContext && (
                <div className="flex items-center gap-2 pt-1 md:pt-2">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">
                    Ngữ cảnh
                  </span>
                  <span className="px-2.5 py-0.5 md:px-3 md:py-1 bg-white border border-slate-100 text-indigo-600 text-[10px] md:text-[11px] font-black rounded-full shadow-sm uppercase whitespace-nowrap">
                    {idiom.usageContext}
                  </span>
                </div>
              )}
            </div>

            {/* Functional Actions */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
              <button
                onClick={handleToggleSave}
                disabled={isSyncing}
                className={`flex-1 md:w-48 h-14 md:h-16 rounded-xl md:rounded-2xl border-2 flex items-center justify-center gap-2 md:gap-3 font-black text-sm md:text-base transition-all active:scale-95 ${
                  isSaved
                    ? "bg-red-50 border-red-200 text-red-600 shadow-xl shadow-red-500/10"
                    : "bg-white border-slate-100 text-slate-400 hover:border-red-200 hover:text-red-600"
                }`}
              >
                {isSyncing ? (
                  <SpinnerIcon className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                ) : (
                  <>
                    <BookmarkIcon
                      className={`w-5 h-5 md:w-6 md:h-6 ${
                        isSaved ? "fill-current" : ""
                      }`}
                    />
                    <span>{isSaved ? "Đã lưu" : "Lưu từ"}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    toast.error("Vui lòng đăng nhập để báo lỗi.");
                    return;
                  }
                  onClickReport();
                }}
                className="flex-1 md:w-48 h-14 md:h-16 bg-slate-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 font-black text-sm md:text-base shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 group"
              >
                <ExclamationIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                <span>Báo lỗi</span>
              </button>
              <button
                onClick={scrollToComments}
                className="flex-1 md:w-48 h-14 md:h-16 bg-white border-2 border-slate-100 text-slate-400 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 font-black text-sm md:text-base hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95 group"
              >
                <ChatBubbleIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                <span>Thảo luận</span>
              </button>
            </div>
          </div>

          {/* Meanings Strip */}
          <div className="mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-5 md:pt-7 border-t border-slate-100/50">
            <div className="space-y-1 md:space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Nghĩa Trung
              </span>
              <p className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">
                {idiom.chineseDefinition || "Chưa có dữ liệu"}
              </p>
            </div>
            <div className="space-y-1 md:space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Nghĩa Việt
              </span>
              <p className="text-base md:text-lg font-bold text-slate-800 italic leading-relaxed">
                {idiom.vietnameseMeaning || "Chưa có dữ liệu"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-6 md:space-y-8">
          {/* Detailed Analysis Section */}
          {idiom.analysis?.length > 0 && (
            <div className="bg-white rounded-3xl md:rounded-4xl p-5 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="w-1.5 md:w-2 h-6 md:h-8 bg-red-600 rounded-full"></div>
                <h3 className="text-xl md:text-2xl font-hanzi font-black text-slate-800">
                  Phân tích chi tiết
                </h3>
              </div>

              <div className="flex flex-wrap gap-6 sm:gap-10 md:gap-14 justify-center md:justify-start">
                {idiom.analysis.map((char, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center group/char scale-90 sm:scale-100"
                  >
                    <div className="relative">
                      <WritingGrid character={char.character} />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-white border border-slate-100 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-[10px] md:text-xs font-black text-red-600">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-6 text-center">
                      <p className="text-red-600 font-black text-lg md:text-xl font-sans tracking-widest mb-0.5 md:mb-1">
                        {char.pinyin}
                      </p>
                      <p className="text-slate-500 text-xs md:text-sm font-bold max-w-[80px] md:max-w-[100px] leading-tight">
                        {char.meaning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Illustration Section */}
          {idiom.imageUrl && (
            <div className="bg-white rounded-3xl md:rounded-4xl overflow-hidden border border-slate-100 shadow-sm group">
              <div className="relative aspect-4/3 sm:aspect-16/7 md:aspect-21/9">
                <img
                  src={idiom.imageUrl}
                  className="w-full h-full object-cover"
                  alt={idiom.hanzi}
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-8 flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="text-white font-black text-xs md:text-sm tracking-wide">
                    Minh họa trực quan
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Origin & Grammar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <InfoCard
              title="Nguồn gốc"
              className="md:order-1"
              icon={<ChevronRightIcon />}
            >
              {idiom.origin}
            </InfoCard>
            <InfoCard
              title="Luyện tập ngữ pháp"
              className="md:order-2"
              icon={<PencilIcon />}
            >
              <div className="space-y-4">
                <p className="text-slate-500 italic text-xs mb-2">
                  Hãy thử điền các chữ Hán còn thiếu:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {idiom.hanzi.split("").map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={grammarAnswers[idx] || ""}
                      readOnly={grammarChecked && isGrammarCorrect === true}
                      onChange={(e) => {
                        const newAns = [...grammarAnswers];
                        newAns[idx] = e.target.value;
                        setGrammarAnswers(newAns);
                        // Auto focus next field
                        if (e.target.value && idx < idiom.hanzi.length - 1) {
                          const nextInput = e.target.parentElement?.children[
                            idx + 1
                          ] as HTMLInputElement;
                          nextInput?.focus();
                        }
                      }}
                      className={`w-10 h-10 md:w-12 md:h-12 border-2 rounded-xl text-center font-hanzi text-xl md:text-2xl transition-all outline-none ${
                        grammarChecked
                          ? isGrammarCorrect
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            : "border-red-500 bg-red-50 text-red-700 animate-shake"
                          : "border-slate-100 bg-slate-50 focus:border-indigo-400 focus:bg-white focus:shadow-lg"
                      }`}
                    />
                  ))}
                </div>

                {!grammarChecked || !isGrammarCorrect ? (
                  <button
                    onClick={checkGrammarResult}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <div className="py-3 bg-emerald-100 text-emerald-700 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 animate-bounce">
                    <CheckCircleIcon className="w-4 h-4" />
                    Tuyệt vời!
                  </div>
                )}

                <details className="group mt-4 cursor-pointer">
                  <summary className="text-indigo-600 font-bold text-sm list-none flex items-center gap-2 group-open:hidden">
                    <span>Xem gợi ý & ứng dụng</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </summary>
                  <div className="mt-3 pl-4 border-l-2 border-indigo-100 animate-fadeIn text-sm">
                    <p className="font-bold text-slate-800 mb-2">
                      Đáp án chính xác: {idiom.hanzi}
                    </p>
                    {idiom.grammar}
                  </div>
                </details>
              </div>
            </InfoCard>
          </div>

          {/* Examples Section */}
          <div className="bg-slate-900 rounded-3xl md:rounded-4xl p-5 md:p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-red-600/10 rounded-full blur-3xl -mr-24 md:-mr-32 -mt-24 md:-mt-32"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-10">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-1.5 md:w-2 h-6 md:h-8 bg-red-600 rounded-full text-sm md:text-base"></div>
                <h3 className="text-xl md:text-3xl font-hanzi font-black">
                  Ví dụ minh họa
                </h3>
              </div>
              <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 w-fit flex items-center gap-2">
                <span>Ứng dụng</span>
                <SpeakerWaveIcon className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              {idiom.examples.slice(0, 2).map((ex, idx) => (
                <div key={idx} className="relative pl-6 md:pl-10 group/ex">
                  <div className="absolute left-0 top-0 w-px h-full bg-white/10"></div>
                  <div className="absolute left-[-3px] md:left-[-4px] top-0 w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>

                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xl md:text-3xl font-hanzi font-medium leading-relaxed flex-1">
                        {ex.chinese}
                      </p>
                      <SpeakButton
                        text={ex.chinese}
                        lang="zh-CN"
                        className="mt-1 bg-white/5 hover:bg-white/10"
                      />
                    </div>
                    <p className="text-red-400 font-black font-sans tracking-widest text-xs md:text-sm uppercase opacity-60">
                      {ex.pinyin}
                    </p>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                      <p className="text-white/70 text-sm md:text-base font-medium italic flex-1">
                        "{ex.vietnamese}"
                      </p>
                      <SpeakButton
                        text={ex.vietnamese}
                        lang="vi-VN"
                        className="bg-white/5 hover:bg-white/10"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Sidebar - Mobile bottom, XL side */}
        <div className="xl:col-span-4 mt-2 md:mt-0">
          <div className="xl:sticky xl:top-24 space-y-4 md:space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl md:rounded-4xl p-5 md:p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-5 md:mb-7">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                  <VideoIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                  Góc học tập
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 md:gap-4">
                <button
                  onClick={handleAddToFlashcard}
                  className="w-full h-14 md:h-16 bg-red-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
                >
                  <CardIcon className="w-5 h-5" />
                  <span>Flashcard</span>
                </button>

                <button
                  onClick={handleStudyAgain}
                  className="w-full h-14 md:h-16 bg-white border-2 border-amber-400 text-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-amber-50 transition-all active:scale-95"
                >
                  <RefreshIcon className="w-5 h-5" />
                  <span>Học lại</span>
                </button>

                <button
                  disabled={!idiom.videoUrl}
                  className={`w-full h-14 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-sm transition-all sm:col-span-2 xl:col-span-1 ${
                    !idiom.videoUrl
                      ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                      : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  }`}
                >
                  <a
                    href={idiom.videoUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <VideoIcon className="w-5 h-5" />
                    <span>Video HD</span>
                  </a>
                </button>
              </div>
            </div>

            {/* Learning Tip Card - Simple on mobile */}
            <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-3xl md:rounded-4xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 md:mb-3">
                Tip học tập
              </h5>
              <p className="text-base md:text-lg font-bold leading-relaxed mb-3 md:mb-5">
                {learningTip}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase">
                <CheckCircleIcon className="w-4 h-4" /> Hệ thống GYSpace
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion Area */}
      <div
        id="discussion-section"
        className="pt-8 md:pt-10 border-t border-slate-100"
      >
        <IdiomComments idiomId={idiom.id} idiomHanzi={idiom.hanzi} />
      </div>
    </Container>
  );
};

export default IdiomDetail;
