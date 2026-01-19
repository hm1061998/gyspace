import { useState, useEffect, useCallback } from "react";
import type { Idiom } from "@/types";
import { toast } from "@/libs/Toast";
import { loadingService } from "@/libs/Loading";
import {
  useSRSData,
  useSavedIdiomsList,
  useUpdateSRS,
} from "@/hooks/queries/useUserData";
import { useStoredIdiomsList } from "@/hooks/queries/useIdioms";
import { useQueryClient } from "@tanstack/react-query";

interface SRSProgress {
  interval: number;
  repetition: number;
  efactor: number;
  nextReviewDate: number;
}

interface SRSDataMap {
  [hanzi: string]: SRSProgress;
}

const LOCAL_SRS_KEY = "guest_srs_progress";

const getLocalSRS = (): SRSDataMap => {
  const stored = localStorage.getItem(LOCAL_SRS_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveLocalSRS = (data: SRSDataMap) => {
  localStorage.setItem(LOCAL_SRS_KEY, JSON.stringify(data));
};

export const useFlashcards = (isLoggedIn: boolean, source: "all" | "saved") => {
  const [reviewQueue, setReviewQueue] = useState<Idiom[]>([]);
  const [currentCard, setCurrentCard] = useState<Idiom | null>(null);
  const [srsDataMap, setSrsDataMap] = useState<SRSDataMap>({});
  const [totalAvailableCards, setTotalAvailableCards] = useState(0);

  // Queries
  const { data: srsDataRes, isLoading: srsLoading } = useSRSData(isLoggedIn);

  const { data: savedDataRes, isLoading: savedLoading } = useSavedIdiomsList(
    { page: 1, limit: 1000 },
    source === "saved",
  );

  const { data: storedDataRes, isLoading: storedLoading } = useStoredIdiomsList(
    { page: 1, limit: 1000 },
    source === "all",
  );

  const loading =
    srsLoading || (source === "saved" ? savedLoading : storedLoading);

  // Mutation
  const { mutateAsync: updateSRS } = useUpdateSRS();
  const queryClient = useQueryClient();

  // Combine SRS Data (Server + Local)
  useEffect(() => {
    const progressMap: SRSDataMap = {};
    if (isLoggedIn && srsDataRes) {
      srsDataRes.data.forEach((item: any) => {
        progressMap[item.idiom.hanzi] = {
          interval: item.interval,
          repetition: item.repetition,
          efactor: item.efactor,
          nextReviewDate: Number(item.nextReviewDate),
        };
      });
    } else if (!isLoggedIn) {
      const localData = getLocalSRS();
      Object.assign(progressMap, localData);
    }
    setSrsDataMap(progressMap);
  }, [isLoggedIn, srsDataRes]);

  // Build Queue
  const buildQueue = useCallback(
    (forceReview = false) => {
      let allCards: Idiom[] = [];
      if (source === "saved" && savedDataRes) {
        allCards = savedDataRes.data;
      } else if (source === "all" && storedDataRes) {
        allCards = storedDataRes.data;
      }

      setTotalAvailableCards(allCards.length);

      let queue: Idiom[] = [];
      if (forceReview) {
        queue = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 20);
      } else {
        const now = Date.now();
        const dueCards = allCards.filter((card) => {
          const progress = srsDataMap[card.hanzi];
          if (!progress) return true; // New cards are due
          return progress.nextReviewDate <= now;
        });

        dueCards.sort((a, b) => {
          const progA = srsDataMap[a.hanzi]?.nextReviewDate || 0;
          const progB = srsDataMap[b.hanzi]?.nextReviewDate || 0;
          return progA - progB;
        });
        queue = dueCards.slice(0, 20);
      }
      setReviewQueue(queue);
    },
    [source, savedDataRes, storedDataRes, srsDataMap],
  );

  // Initial build when data is ready
  useEffect(() => {
    if (!loading) {
      buildQueue(false);
    }
  }, [loading, buildQueue]);

  // Update current card
  useEffect(() => {
    if (reviewQueue.length > 0) {
      setCurrentCard(reviewQueue[0]);
    } else {
      setCurrentCard(null);
    }
  }, [reviewQueue]);

  const loadData = useCallback(
    async (forceReview = false) => {
      // With RQ, we technically just rebuild the queue from existing cache
      // or trigger a refetch if needed. For now, just rebuild queue.
      buildQueue(forceReview);
    },
    [buildQueue],
  );

  const handleRate = async (quality: number) => {
    if (!currentCard || !currentCard.id) return;

    loadingService.show("Đang đồng bộ...");
    try {
      if (isLoggedIn) {
        // Optimistic update done by RQ invalidation?
        // Actually, mutation return logic is complex.
        // We'll trust the mutation response or update local state manually for immediate feedback.
        // The original code used the result to update local srsData state.
        // We can do the same if we want to reflect it immediately in the queue loop without refetching all 1000 items.
        // However, since we are moving to next card, the `srsDataMap` is only used for *filtering* the next batch.
        // The current card is already popped.
        await updateSRS({ id: currentCard.id, quality });
        queryClient.invalidateQueries({ queryKey: ["user", "srs"] });
      } else {
        // GUEST MODE: Calculate SM-2 locally (Same as before)
        const existing = srsDataMap[currentCard.hanzi] || {
          interval: 0,
          repetition: 0,
          efactor: 2.5,
          nextReviewDate: Date.now(),
        };

        const q = quality;
        let { interval, repetition, efactor } = existing;

        if (q >= 3) {
          if (repetition === 0) {
            interval = q === 5 ? 4 : 1;
          } else if (repetition === 1) {
            interval = 6;
          } else {
            interval = Math.ceil(interval * efactor);
          }
          repetition += 1;
        } else {
          repetition = 0;
          interval = 1;
        }

        if (efactor < 1.3) efactor = 1.3;

        // Quality < 3 (Again) uses 1-minute interval
        const intervalMs = q < 3 ? 60 * 1000 : interval * 24 * 60 * 60 * 1000;
        const nextReviewDate = Date.now() + intervalMs;
        const newProgress = { interval, repetition, efactor, nextReviewDate };

        const allLocal = getLocalSRS();
        allLocal[currentCard.hanzi] = newProgress;
        saveLocalSRS(allLocal);

        setSrsDataMap((prev) => ({
          ...prev,
          [currentCard.hanzi]: newProgress,
        }));
      }

      // Queue Management
      if (quality < 3) {
        setReviewQueue((prev) => [...prev.slice(1), currentCard]);
      } else {
        setReviewQueue((prev) => prev.slice(1));
      }
    } catch (err) {
      console.error("SRS sync error", err);
      toast.error("Không thể lưu kết quả học tập.");
    } finally {
      loadingService.hide();
    }
  };

  const getNextIntervalLabel = (quality: number) => {
    if (!currentCard) return "";
    const existing = srsDataMap[currentCard.hanzi] || {
      interval: 0,
      repetition: 0,
      efactor: 2.5,
    };

    if (quality < 3) return "1 phút";

    let interval = 0;
    if (existing.repetition === 0) {
      if (quality === 3) interval = 1;
      else if (quality === 4)
        interval = 2; // Better for Good
      else if (quality === 5) interval = 4; // Better for Easy
    } else if (existing.repetition === 1) {
      interval = 6;
      if (quality === 4) interval = Math.ceil(interval * 1.2);
      if (quality === 5) interval = Math.ceil(interval * 1.5);
    } else {
      interval = Math.ceil(existing.interval * existing.efactor);
      if (quality === 4) interval = Math.ceil(interval * 1.2);
      if (quality === 5) interval = Math.ceil(interval * 1.5);
    }

    return interval === 1 ? "1 ngày" : `${interval} ngày`;
  };

  return {
    reviewQueue,
    currentCard,
    loading,
    totalAvailableCards,
    handleRate,
    getNextIntervalLabel,
    loadData,
  };
};
