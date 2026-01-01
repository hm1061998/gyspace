import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeftIcon,
  PuzzlePieceIcon,
  SpinnerIcon,
} from "@/components/common/icons";
import { fetchStoredIdioms } from "@/services/api/idiomService";
import type { Idiom } from "@/types";

interface WordSearchGameProps {
  onBack: () => void;
}

const GRID_SIZE = 9;
const RANDOM_CHARS =
  "的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样想向道命此位理望果料建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流身级少回规斯近领千";

const WordSearchGame: React.FC<WordSearchGameProps> = ({ onBack }) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<Idiom[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]); // List of IDIOM IDs
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selection, setSelection] = useState<{
    start: { r: number; c: number };
    end: { r: number; c: number };
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  // Prevent default touch actions to stop scrolling while playing
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (
        containerRef.current &&
        containerRef.current.contains(e.target as Node)
      ) {
        // Only prevent default if we are dragging
        // We handle this via CSS touch-action: none, but this is a backup
      }
    };
    document.addEventListener("touchmove", preventDefault, { passive: false });
    return () => document.removeEventListener("touchmove", preventDefault);
  }, []);

  const startNewGame = async () => {
    setLoading(true);
    setFoundWords([]);
    setSelection(null);
    try {
      // 1. Get random words
      const response = await fetchStoredIdioms(1, 100);
      // Filter valid Chinese idioms (length <= 4)
      const allIdioms = response.data.filter(
        (i: Idiom) => i.hanzi.length <= 4 && /[\u4e00-\u9fa5]+/.test(i.hanzi)
      );

      const gameWords: Idiom[] = [];
      const usedIndices = new Set();

      // If we don't have enough words, duplication might occur, handled by Set logic
      const maxWords = Math.min(5, allIdioms.length);

      while (
        gameWords.length < maxWords &&
        usedIndices.size < allIdioms.length
      ) {
        const idx = Math.floor(Math.random() * allIdioms.length);
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx);
          gameWords.push(allIdioms[idx]);
        }
      }

      setWords(gameWords);
      generateGrid(gameWords);
    } catch (e) {
      console.error("Game load error", e);
    } finally {
      setLoading(false);
    }
  };

  const generateGrid = (gameWords: Idiom[]) => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(""));
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const wordObj of gameWords) {
      const word = wordObj.hanzi;
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * GRID_SIZE);
        const startCol = Math.floor(Math.random() * GRID_SIZE);

        const endRow = startRow + dir[0] * (word.length - 1);
        const endCol = startCol + dir[1] * (word.length - 1);

        if (
          endRow >= 0 &&
          endRow < GRID_SIZE &&
          endCol >= 0 &&
          endCol < GRID_SIZE
        ) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const r = startRow + dir[0] * i;
            const c = startCol + dir[1] * i;
            if (newGrid[r][c] !== "" && newGrid[r][c] !== word[i]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              const r = startRow + dir[0] * i;
              const c = startCol + dir[1] * i;
              newGrid[r][c] = word[i];
            }
            placed = true;
          }
        }
        attempts++;
      }
    }

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === "") {
          newGrid[r][c] =
            RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
        }
      }
    }
    setGrid(newGrid);
  };

  // --- Interaction Logic (Pointer Events) ---

  const handlePointerDown = (e: React.PointerEvent, r: number, c: number) => {
    e.preventDefault();
    setSelection({ start: { r, c }, end: { r, c } });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!selection) return;
    e.preventDefault();

    // Use elementFromPoint to find the cell under the cursor/finger
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const cell = target?.closest("[data-cell]");

    if (cell) {
      const r = parseInt(cell.getAttribute("data-row") || "-1");
      const c = parseInt(cell.getAttribute("data-col") || "-1");

      if (r !== -1 && c !== -1) {
        setSelection((prev) => (prev ? { ...prev, end: { r, c } } : null));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (selection) {
      checkWord(selection.start, selection.end);
      setSelection(null);
    }
  };

  const checkWord = (
    start: { r: number; c: number },
    end: { r: number; c: number }
  ) => {
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    if (steps === 0) return;

    // Check if straight line
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return;

    const rStep = dr === 0 ? 0 : dr / steps;
    const cStep = dc === 0 ? 0 : dc / steps;

    let formedWord = "";
    for (let i = 0; i <= steps; i++) {
      const r = start.r + rStep * i;
      const c = start.c + cStep * i;
      formedWord += grid[r][c];
    }

    const reverseWord = formedWord.split("").reverse().join("");
    const found = words.find(
      (w) => w.hanzi === formedWord || w.hanzi === reverseWord
    );

    if (found && !foundWords.includes(found.id)) {
      setFoundWords((prev) => [...prev, found.id]);
    }
  };

  const isCellSelected = (r: number, c: number) => {
    if (!selection) return false;
    const { start, end } = selection;

    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return r === start.r && c === start.c;

    // Check if diagonal/straight
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;

    const rStep = dr === 0 ? 0 : dr / steps;
    const cStep = dc === 0 ? 0 : dc / steps;

    for (let i = 0; i <= steps; i++) {
      if (r === start.r + rStep * i && c === start.c + cStep * i) return true;
    }
    return false;
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-pop select-none p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold font-hanzi flex items-center gap-3 text-slate-800">
          <PuzzlePieceIcon className="w-8 h-8 text-red-600" />
          Tìm chữ Hán
        </h1>
        <button
          onClick={startNewGame}
          className="text-sm font-bold bg-slate-800 text-white px-4 py-2 rounded-xl active:scale-95 transition-transform hover:bg-black"
        >
          Ván mới
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <SpinnerIcon className="w-10 h-10 text-red-600" />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-16 w-full">
          {/* The Grid Area - Flexible on Desktop */}
          <div className="flex-1 w-full flex justify-center md:justify-end">
            <div
              ref={containerRef}
              className="grid gap-1 md:gap-2 bg-slate-200 p-2 md:p-3 rounded-xl shadow-inner select-none touch-none w-full"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                aspectRatio: "1/1",
                maxWidth: "700px", // Increased max width for Desktop
              }}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerMove={handlePointerMove}
            >
              {grid.map((row, r) =>
                row.map((char, c) => (
                  <div
                    key={`${r}-${c}`}
                    data-cell="true"
                    data-row={r}
                    data-col={c}
                    className={`
                                    flex items-center justify-center 
                                    text-lg md:text-4xl font-hanzi font-bold 
                                    rounded-md md:rounded-lg transition-all cursor-pointer shadow-sm
                                    ${
                                      isCellSelected(r, c)
                                        ? "bg-red-500 text-white scale-105 shadow-md z-10"
                                        : "bg-white text-slate-700 hover:bg-red-50"
                                    }
                                `}
                    onPointerDown={(e) => handlePointerDown(e, r, c)}
                  >
                    {char}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Word List Area - Fixed Width on Desktop */}
          <div className="w-full md:w-96 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 sticky top-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">
                Từ cần tìm ({foundWords.length}/{words.length})
              </h3>

              {words.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  Không tải được từ vựng.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {words.map((w) => {
                    const isFound = foundWords.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isFound
                            ? "bg-emerald-50 border-emerald-200 opacity-60"
                            : "bg-slate-50 border-slate-100 hover:border-red-200"
                        }`}
                      >
                        <div>
                          <p
                            className={`font-bold text-sm ${
                              isFound
                                ? "text-emerald-700 line-through"
                                : "text-slate-800"
                            }`}
                          >
                            {w.vietnameseMeaning}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {w.pinyin}
                          </p>
                        </div>
                        {isFound && (
                          <div className="text-emerald-600 font-hanzi font-bold text-lg">
                            {w.hanzi}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {words.length > 0 && foundWords.length === words.length && (
                <div className="mt-6 pt-4 border-t border-slate-100 text-center animate-pop">
                  <p className="text-emerald-600 font-bold text-xl mb-3">
                    🎉 Xuất sắc!
                  </p>
                  <button
                    onClick={startNewGame}
                    className="w-full py-4 bg-red-700 text-white rounded-xl font-bold hover:bg-red-800 shadow-lg shadow-red-200 transition-all active:scale-95"
                  >
                    Chơi ván mới
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchGame;
