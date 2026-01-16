import React from "react";
import { HistoryIcon, SearchIcon, TrashIcon } from "@/components/common/icons";
import Container from "@/components/common/Container";

interface HistoryHeaderProps {
  filter: string;
  setFilter: (val: string) => void;
  onClearAll: () => void;
  showClearAll: boolean;
}

const HistoryHeader: React.FC<HistoryHeaderProps> = ({
  filter,
  setFilter,
  onClearAll,
  showClearAll,
}) => {
  return (
    <div className="flex-none bg-white border-b border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-20 py-6 md:py-8">
      <Container>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <HistoryIcon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-hanzi font-black text-slate-800 tracking-tight">
                Lịch sử tìm kiếm
              </h1>
              <p className="text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                Dấu chân hành trình của bạn
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative group">
              <input
                type="text"
                placeholder="Tìm trong lịch sử..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-64 pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300 shadow-sm"
              />
              <SearchIcon className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-slate-500 transition-colors" />
            </div>

            {showClearAll && (
              <button
                onClick={onClearAll}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Xóa sạch</span>
              </button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HistoryHeader;
