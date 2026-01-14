import React, { useEffect, useRef, useState } from "react";
import {
  SpinnerIcon,
  RefreshIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  CardIcon,
} from "@/components/common/icons";
import {
  useWordSearchGame,
  GameDifficulty,
  GameMode,
} from "@/hooks/useWordSearchGame";
import GameHeader from "@/components/game/GameHeader";
import GameBoard from "@/components/game/GameBoard";
import GameWordList from "@/components/game/GameWordList";

interface WordSearchGameProps {
  onBack: () => void;
}

const WordSearchGame: React.FC<WordSearchGameProps> = () => {
  const {
    grid,
    words,
    foundWords,
    loading,
    difficulty,
    mode,
    gameStarted,
    startNewGame,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isCellSelected,
    GRID_SIZE,
    setGameStarted,
  } = useWordSearchGame();

  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<GameDifficulty>("easy");
  const [selectedMode, setSelectedMode] = useState<GameMode>("all");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (
        containerRef.current &&
        containerRef.current.contains(e.target as Node)
      ) {
        // Prevent default touch actions while playing to avoid scroll
        if (e.cancelable) e.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventDefault, { passive: false });
    return () => document.removeEventListener("touchmove", preventDefault);
  }, []);

  if (!gameStarted) {
    return (
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col justify-center animate-pop p-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-hanzi font-black text-slate-800">
              Cài đặt trò chơi
            </h2>
            <p className="text-slate-500 font-medium">
              Chọn mức độ và chế độ chơi phù hợp với bạn
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Độ khó
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDiff(d)}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      selectedDiff === d
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    {d === "easy" ? "Dễ" : d === "medium" ? "Vừa" : "Khó"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Chế độ từ vựng
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedMode("all")}
                  className={`py-4 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition-all ${
                    selectedMode === "all"
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200"
                  }`}
                >
                  <RefreshIcon className="w-5 h-5" />
                  <span>Tất cả từ</span>
                </button>
                <button
                  onClick={() => setSelectedMode("saved")}
                  className={`py-4 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition-all ${
                    selectedMode === "saved"
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200"
                  }`}
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Từ đã lưu</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={() => startNewGame(selectedDiff, selectedMode)}
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Bắt đầu chơi</span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className="w-full py-4 text-slate-500 font-bold text-sm hover:text-indigo-600 transition-colors"
            >
              Xem hướng dẫn
            </button>
          </div>
        </div>

        {showTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-pop">
              <h3 className="text-2xl font-black text-slate-800 mb-6">
                Cách chơi
              </h3>
              <ul className="space-y-4 text-slate-600 font-medium text-sm">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    1
                  </div>
                  <span>
                    Tìm các từ vựng trong danh sách phía bên phải trong bảng chữ
                    cái.
                  </span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    2
                  </div>
                  <span>
                    Nhấn và kéo để chọn các chữ cái liên tiếp theo hàng ngang,
                    dọc hoặc chéo.
                  </span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    3
                  </div>
                  <span>
                    Độ khó càng cao, bạn càng nhận được ít gợi ý về chữ Hán và
                    Pinyin.
                  </span>
                </li>
              </ul>
              <button
                onClick={() => setShowTutorial(false)}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                Đã rõ!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-pop select-none p-4 md:p-8 overflow-hidden relative">
      <GameHeader
        onNewGame={() => startNewGame(difficulty, mode)}
        onShowTutorial={() => setShowTutorial(true)}
        onReset={() => setGameStarted(false)}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <SpinnerIcon className="w-10 h-10 text-red-600" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full min-h-0 overflow-hidden">
          <div className="shrink-0 scale-90 sm:scale-100">
            <GameBoard
              grid={grid}
              GRID_SIZE={GRID_SIZE}
              isCellSelected={isCellSelected}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              containerRef={containerRef}
            />
          </div>
          <GameWordList
            words={words}
            foundWords={foundWords}
            onNewGame={() => startNewGame(difficulty, mode)}
            difficulty={difficulty}
          />
        </div>
      )}

      {showTutorial && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-pop">
            <h3 className="text-2xl font-black text-slate-800 mb-6">
              Cách chơi
            </h3>
            <ul className="space-y-4 text-slate-600 font-medium text-sm">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  1
                </div>
                <span>
                  Tìm các từ vựng trong danh sách phía bên phải trong bảng chữ
                  cái.
                </span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  2
                </div>
                <span>
                  Nhấn và kéo để chọn các chữ cái liên tiếp theo hàng ngang, dọc
                  hoặc chéo.
                </span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  3
                </div>
                <span>
                  Độ khó càng cao, bạn càng nhận được ít gợi ý về chữ Hán và
                  Pinyin.
                </span>
              </li>
            </ul>
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Đã rõ!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchGame;
