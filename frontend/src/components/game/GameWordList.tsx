import React from "react";
import type { Idiom } from "@/types";
import { GameDifficulty } from "@/hooks/useWordSearchGame";

interface GameWordListProps {
  words: Idiom[];
  foundWords: string[];
  onNewGame: () => void;
  difficulty: GameDifficulty;
}

const GameWordList: React.FC<GameWordListProps> = ({
  words,
  foundWords,
  onNewGame,
  difficulty,
}) => {
  const isFinished = words.length > 0 && foundWords.length === words.length;

  return (
    <div className="w-full md:w-96 shrink-0">
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 sticky top-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">
          Từ cần tìm ({foundWords.length}/{words.length})
        </h3>

        {words.length === 0 ? (
          <p className="text-slate-500 text-sm">Không tải được từ vựng.</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {words.map((w) => {
              const isFound = foundWords.includes(w.id);
              return (
                <div
                  key={w.id}
                  className={`flex flex-col p-3 rounded-xl border transition-all ${
                    isFound
                      ? "bg-emerald-50 border-emerald-200 opacity-60"
                      : "bg-slate-50 border-slate-100 hover:border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-bold text-sm truncate ${
                          isFound
                            ? "text-emerald-700 line-through"
                            : "text-slate-800"
                        }`}
                      >
                        {w.vietnameseMeaning}
                      </p>
                      {(difficulty !== "hard" || isFound) && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {w.pinyin}
                        </p>
                      )}
                    </div>
                    {(difficulty === "easy" || isFound) && (
                      <div
                        className={`font-hanzi font-bold text-lg shrink-0 ${
                          isFound ? "text-emerald-600" : "text-slate-300"
                        }`}
                      >
                        {w.hanzi}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isFinished && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center animate-pop">
            <p className="text-emerald-600 font-bold text-xl mb-3">
              🎉 Xuất sắc!
            </p>
            <button
              onClick={onNewGame}
              className="w-full py-4 bg-red-700 text-white rounded-xl font-bold hover:bg-red-800 shadow-lg shadow-red-200 transition-all active:scale-95"
            >
              Chơi ván mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameWordList;
