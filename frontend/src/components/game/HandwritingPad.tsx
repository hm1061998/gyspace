import React, { useRef, useState, useEffect } from "react";
import { CloseIcon, SpinnerIcon } from "@/components/common/icons";

interface HandwritingPadProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterSelect: (char: string) => void;
}

const HandwritingPad: React.FC<HandwritingPadProps> = ({
  isOpen,
  onClose,
  onCharacterSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<number[][][]>([]);
  const [currentStroke, setCurrentStroke] = useState<number[][]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStrokes([]);
    setCurrentStroke([]);
    setSuggestions([]);
  };

  const handleMouseDown = (e: any) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    setIsDrawing(true);
    setCurrentStroke([[x, y]]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      const last = currentStroke[currentStroke.length - 1];
      ctx.moveTo(last[0], last[1]);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setCurrentStroke((prev) => [...prev, [x, y]]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStrokes((prev) => [...prev, currentStroke]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Viết tay</h3>
          <button onClick={onClose}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width="300"
          height="300"
          className="border rounded-lg bg-slate-50 w-full aspect-square touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-slate-100 rounded-lg text-sm"
          >
            Xóa
          </button>
          <div className="flex-1 flex gap-1 overflow-x-auto">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onCharacterSelect(s)}
                className="w-10 h-10 border rounded flex items-center justify-center text-xl font-hanzi"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandwritingPad;
