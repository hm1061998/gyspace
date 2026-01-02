import React, { useEffect, useState } from "react";
import { CloseIcon } from "./icons";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = "",
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Sync shouldRender with isOpen to allow exit animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${
        !isOpen ? "pointer-events-none" : ""
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm ${
          isOpen ? "animate-fade-in" : "animate-fade-out"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col border-l border-slate-100 ${
          isOpen ? "animate-slide-in-right" : "animate-slide-out-right"
        } ${className}`}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
