import React from "react";

interface FlashcardRatingControlsProps {
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (e: React.MouseEvent, quality: number) => void;
  getNextIntervalLabel: (quality: number) => string;
}

const FlashcardRatingControls: React.FC<FlashcardRatingControlsProps> = ({
  isFlipped,
  onFlip,
  onRate,
  getNextIntervalLabel,
}) => {
  return (
    <div className="w-full max-w-xl h-20">
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2 md:gap-3 h-full animate-pop">
          <button
            onClick={(e) => onRate(e, 0)}
            className="flex flex-col items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl transition-all active:scale-95 border border-red-200"
          >
            <span className="font-bold text-xs md:text-sm">Học lại</span>
            <span className="text-[10px] opacity-70 font-medium">
              {getNextIntervalLabel(0)}
            </span>
          </button>
          <button
            onClick={(e) => onRate(e, 3)}
            className="flex flex-col items-center justify-center bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-2xl transition-all active:scale-95 border border-orange-200"
          >
            <span className="font-bold text-xs md:text-sm">Khó</span>
            <span className="text-[10px] opacity-70 font-medium">
              {getNextIntervalLabel(3)}
            </span>
          </button>
          <button
            onClick={(e) => onRate(e, 4)}
            className="flex flex-col items-center justify-center bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-2xl transition-all active:scale-95 border border-sky-200"
          >
            <span className="font-bold text-xs md:text-sm">Tốt</span>
            <span className="text-[10px] opacity-70 font-medium">
              {getNextIntervalLabel(4)}
            </span>
          </button>
          <button
            onClick={(e) => onRate(e, 5)}
            className="flex flex-col items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-2xl transition-all active:scale-95 border border-emerald-200"
          >
            <span className="font-bold text-xs md:text-sm">Dễ</span>
            <span className="text-[10px] opacity-70 font-medium">
              {getNextIntervalLabel(5)}
            </span>
          </button>
        </div>
      ) : (
        <button
          onClick={onFlip}
          className="w-full h-full bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-black transition-all active:scale-[0.98]"
        >
          Xem đáp án
        </button>
      )}
    </div>
  );
};

export default FlashcardRatingControls;
