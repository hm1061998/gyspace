import React from "react";
import { ArrowLeftIcon } from "./icons";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = "Quay lại",
  className = "",
  showIcon = true,
}) => {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all active:scale-95 text-slate-500 hover:text-slate-900 ${className}`}
      aria-label={label}
    >
      {showIcon && (
        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300">
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </div>
      )}
      {label && (
        <span className="text-xs font-black uppercase tracking-widest">
          {label}
        </span>
      )}
    </button>
  );
};

export default BackButton;
