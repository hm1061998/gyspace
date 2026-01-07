import React from "react";
import { SpinnerIcon } from "@/components/common/icons";

interface GlobalLoadingUIProps {
  isLoading: boolean;
  message: string;
}

const GlobalLoadingUI: React.FC<GlobalLoadingUIProps> = ({
  isLoading,
  message,
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full mx-4 border border-slate-100 animate-pop">
        <div className="relative">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <SpinnerIcon className="w-10 h-10 text-red-600" />
          </div>
          <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
        </div>
        <p className="text-slate-800 font-black text-center tracking-tight">
          {message}
        </p>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          Vui lòng đợi trong giây lát
        </p>
      </div>
    </div>
  );
};

export default GlobalLoadingUI;
