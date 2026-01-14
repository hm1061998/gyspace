import React from "react";
import {
  PuzzlePieceIcon,
  QuestionMarkIcon,
  SettingsIcon,
} from "@/components/common/icons";

interface GameHeaderProps {
  onNewGame: () => void;
  onShowTutorial: () => void;
  onReset: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  onNewGame,
  onShowTutorial,
  onReset,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-10 pt-2">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
          <PuzzlePieceIcon className="w-7 h-7 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-hanzi text-slate-800 tracking-tight">
            Tìm chữ Hán
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
            Word Search Challenge
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onShowTutorial}
          className="p-3 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
          title="Xem hướng dẫn"
        >
          <QuestionMarkIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onReset}
          className="p-3 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95 shadow-sm"
          title="Chọn lại độ khó"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onNewGame}
          className="ml-2 text-sm font-black bg-slate-900 text-white px-6 py-3 rounded-2xl active:scale-95 transition-all hover:bg-black shadow-xl shadow-slate-900/20"
        >
          Ván mới
        </button>
      </div>
    </div>
  );
};

export default GameHeader;
