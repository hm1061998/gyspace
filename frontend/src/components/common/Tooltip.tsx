import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 200,
}) => {
  const [active, setActive] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      // Position logic relative to the viewport + scroll
      switch (position) {
        case "top":
          top = rect.top + scrollY - 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + scrollY + 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case "left":
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 8;
          break;
        case "right":
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX + rect.width + 8;
          break;
      }

      setCoords({ top, left });
    }
  };

  const showTip = () => {
    updateCoords();
    timeoutRef.current = setTimeout(() => {
      setActive(true);
    }, delay);
  };

  const hideTip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActive(false);
  };

  useEffect(() => {
    if (active) {
      window.addEventListener("scroll", hideTip, { capture: true });
      window.addEventListener("resize", hideTip);
    }
    return () => {
      window.removeEventListener("scroll", hideTip, { capture: true });
      window.removeEventListener("resize", hideTip);
    };
  }, [active]);

  const getTranslateClass = () => {
    switch (position) {
      case "top":
        return "-translate-x-1/2 -translate-y-full";
      case "bottom":
        return "-translate-x-1/2";
      case "left":
        return "-translate-x-full -translate-y-1/2";
      case "right":
        return "-translate-y-1/2";
      default:
        return "";
    }
  };

  return (
    <div
      ref={triggerRef}
      className="inline-flex items-center"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {children}
      {active &&
        createPortal(
          <div
            className={`fixed z-[9999] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 rounded-lg whitespace-nowrap shadow-2xl pointer-events-none animate-fade-in ${getTranslateClass()}`}
            style={{
              top: coords.top - window.scrollY,
              left: coords.left - window.scrollX,
            }}
          >
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-1.5 h-1.5 bg-slate-900 rotate-45 ${
                position === "top"
                  ? "bottom-[-3px] left-1/2 -translate-x-1/2"
                  : position === "bottom"
                  ? "top-[-3px] left-1/2 -translate-x-1/2"
                  : position === "left"
                  ? "right-[-3px] top-1/2 -translate-y-1/2"
                  : "left-[-3px] top-1/2 -translate-y-1/2"
              }`}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;
