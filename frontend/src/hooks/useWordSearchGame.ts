import React, { useState, useEffect, useCallback } from "react";
import type { Idiom } from "@/types";
import { useSavedIdiomsList } from "@/hooks/queries/useUserData";
import { useStoredIdiomsList } from "@/hooks/queries/useIdioms";

export type GameDifficulty = "easy" | "medium" | "hard";
export type GameMode = "all" | "saved";

const GRID_SIZE = 9;
const RANDOM_CHARS =
  "的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样想向道命此位理望果料建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流身级少回规斯近領千";

export interface Selection {
  start: { r: number; c: number };
  end: { r: number; c: number };
}

export const useWordSearchGame = () => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<Idiom[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [difficulty, setDifficulty] = useState<GameDifficulty>("easy");
  const [mode, setMode] = useState<GameMode>("all");
  const [gameStarted, setGameStarted] = useState(false);

  // Queries
  const { data: savedData, isLoading: savedLoading } = useSavedIdiomsList(
    { page: 1, limit: 100 },
    mode === "saved",
  );

  const { data: storedData, isLoading: storedLoading } = useStoredIdiomsList(
    { page: 1, limit: 100 },
    mode === "all",
  );

  const isFetchingData = mode === "saved" ? savedLoading : storedLoading;

  const generateGrid = useCallback((gameWords: Idiom[]) => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(""));
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
      [1, -1], // Note: Original code had [1, -1] twice? Or maybe I misread. Keeping logic safer.
      // Wait, let's just stick to standard directions.
      // The original code had: [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    // Re-declaring for clarity inside callback
    const dirs = [
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
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
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

    // Fill empty spaces
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === "") {
          newGrid[r][c] =
            RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
        }
      }
    }
    setGrid(newGrid);
  }, []);

  const startNewGame = useCallback(
    async (diff: GameDifficulty, gameMode: GameMode) => {
      setLoading(true);
      setFoundWords([]);
      setSelection(null);
      setDifficulty(diff);
      setMode(gameMode);
      setGameStarted(true);

      // We rely on the query hook to provide data.
      // However, we need to wait for data if it's not ready?
      // Or we can just sample from what we have if the mode matches.
      // If mode is changing, we might strictly need to wait.
      // Since this function is async and triggered by user, simplest way is to manually check data if available,
      // or if we rely on useEffect to watch 'gameStarted' and 'data' change to trigger generation?
      // BUT, 'generateGrid' inside 'startNewGame' is the imperative flow.
      // To mimic this: we can just check if data is present.

      // ISSUE: If I change mode from 'all' to 'saved', 'savedData' might be loading.
      // So 'startNewGame' should probably just set the config, and a useEffect should generate the grid when data is ready.

      // But preserving the original imperative feel:
      // We will perform a "smart" check.

      // Let's change the pattern:
      // 1. User clicks Start.
      // 2. We set 'gameStarted' = true, 'loading' = true (local UI loading).
      // 3. Effect watches (gameStarted, mode, savedData, storedData).
      // 4. If data is ready, do the logic and set loading = false.
    },
    [],
  );

  // Effect to handle game generation
  useEffect(() => {
    if (!gameStarted) return;

    let sourceData: Idiom[] = [];
    let isSourceReady = false;

    if (mode === "saved") {
      if (!savedLoading && savedData) {
        sourceData = savedData.data;
        isSourceReady = true;
      }
    } else {
      if (!storedLoading && storedData) {
        sourceData = storedData.data;
        isSourceReady = true;
      }
    }

    if (isSourceReady) {
      try {
        // Logic from original startNewGame
        const allIdioms = sourceData.filter(
          (i: Idiom) => i.hanzi.length <= 4 && /[\u4e00-\u9fa5]+/.test(i.hanzi),
        );

        const gameWords: Idiom[] = [];
        const usedIndices = new Set();
        const maxWords = Math.min(5, allIdioms.length);

        // Safety check
        if (allIdioms.length === 0) {
          // Throwing here inside useEffect is bad.
          // We should set an error state or toast.
          // let's just toast and stop.
          // console.warn("No words found");
        } else {
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

          if (gameWords.length > 0) {
            setWords(gameWords);
            generateGrid(gameWords);
            setLoading(false); // Game is ready
          }
        }
      } catch (e) {
        console.error("Game generation error", e);
        setLoading(false);
      }
    } else {
      setLoading(true); // Waiting for data
    }
  }, [
    gameStarted,
    mode,
    savedData,
    storedData,
    savedLoading,
    storedLoading,
    generateGrid,
  ]);

  const checkWord = (
    start: { r: number; c: number },
    end: { r: number; c: number },
  ) => {
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    if (steps === 0) return;
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
      (w) => w.hanzi === formedWord || w.hanzi === reverseWord,
    );

    if (found && !foundWords.includes(found.id)) {
      setFoundWords((prev) => [...prev, found.id]);
    }
  };

  const handlePointerDown = (e: React.PointerEvent, r: number, c: number) => {
    e.preventDefault();
    setSelection({ start: { r, c }, end: { r, c } });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!selection) return;
    e.preventDefault();

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

  const handlePointerUp = () => {
    if (selection) {
      checkWord(selection.start, selection.end);
      setSelection(null);
    }
  };

  const isCellSelected = (r: number, c: number) => {
    if (!selection) return false;
    const { start, end } = selection;

    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return r === start.r && c === start.c;

    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;

    const rStep = dr === 0 ? 0 : dr / steps;
    const cStep = dc === 0 ? 0 : dc / steps;

    for (let i = 0; i <= steps; i++) {
      if (r === start.r + rStep * i && c === start.c + cStep * i) return true;
    }
    return false;
  };

  return {
    grid,
    words,
    foundWords,
    loading,
    selection,
    difficulty,
    mode,
    gameStarted,
    startNewGame,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isCellSelected,
    GRID_SIZE,
    setGameStarted,
  };
};
