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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-10">
      <div className="flex items-center gap-3">
        <PuzzlePieceIcon className="w-8 h-8 text-red-600" />
        <h1 className="text-2xl md:text-3xl font-bold font-hanzi text-slate-800">
          Tìm chữ Hán
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onShowTutorial}
          className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
          title="Xem hướng dẫn"
        >
          <QuestionMarkIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onReset}
          className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95"
          title="Chọn lại độ khó"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onNewGame}
          className="ml-2 text-sm font-black bg-slate-900 text-white px-5 py-2.5 rounded-xl active:scale-95 transition-all hover:bg-black shadow-lg shadow-slate-900/10"
        >
          Ván mới
        </button>
      </div>
    </div>
  );
};

export default GameHeader;
