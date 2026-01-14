import React, { useState, useEffect } from "react";
import { SpinnerIcon } from "@/components/common/icons";
import Container from "@/components/common/Container";
import { toast } from "@/libs/Toast";
import { useOutletContext } from "react-router-dom";
import { useFlashcards } from "@/hooks/useFlashcards";
import FlashcardHeader from "@/components/flashcard/FlashcardHeader";
import FlashcardEmptyState from "@/components/flashcard/FlashcardEmptyState";
import FlashcardCompletionState from "@/components/flashcard/FlashcardCompletionState";
import FlashcardItem from "@/components/flashcard/FlashcardItem";
import FlashcardRatingControls from "@/components/flashcard/FlashcardRatingControls";

interface FlashcardReviewProps {
  onBack: () => void;
}

const FlashcardReview: React.FC<FlashcardReviewProps> = ({ onBack }) => {
  const { isLoggedIn } = useOutletContext<{ isLoggedIn: boolean }>();
  const [source, setSource] = useState<"all" | "saved">("all");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    reviewQueue,
    currentCard,
    loading,
    totalAvailableCards,
    handleRate,
    getNextIntervalLabel,
    loadData,
  } = useFlashcards(isLoggedIn, source);

  useEffect(() => {
    setIsTransitioning(true);
    setIsFlipped(false);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentCard]);

  const speak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    window.speechSynthesis.speak(u);
  };

  return (
    <Container className="flex flex-col h-full animate-pop py-4 md:py-10">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <SpinnerIcon className="w-10 h-10 text-red-600" />
        </div>
      ) : (
        <>
          <FlashcardHeader
            source={source}
            setSource={setSource}
            isLoggedIn={isLoggedIn}
            reviewQueueLength={reviewQueue.length}
            onSavedClickError={() =>
              toast.error("Vui lòng đăng nhập để sử dụng tính năng này.")
            }
          />

          {!isLoggedIn && (
            <div className="bg-amber-50 border border-amber-100/50 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                <span className="font-bold text-lg">!</span>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800">Chế độ khách</p>
                <p className="text-[10px] text-amber-600/80 font-medium">
                  Tiến độ của bạn sẽ chỉ được lưu trên trình duyệt này. Hãy đăng
                  nhập để đồng bộ hóa dữ liệu.
                </p>
              </div>
            </div>
          )}

          {!currentCard ? (
            totalAvailableCards === 0 ? (
              <FlashcardEmptyState source={source} onBack={onBack} />
            ) : (
              <FlashcardCompletionState
                onReviewMore={() => loadData(true)}
                onBack={onBack}
              />
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <FlashcardItem
                card={currentCard}
                isFlipped={isFlipped}
                isTransitioning={isTransitioning}
                onFlip={() => !isFlipped && setIsFlipped(true)}
                onSpeak={speak}
              />
              <FlashcardRatingControls
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(true)}
                onRate={async (e, rating) => {
                  e.stopPropagation();
                  await handleRate(rating);
                }}
                getNextIntervalLabel={getNextIntervalLabel}
              />
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default FlashcardReview;
