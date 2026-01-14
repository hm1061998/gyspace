import { useState, useEffect, useCallback } from "react";
import { fetchStoredIdioms } from "@/services/api/idiomService";
import {
  fetchSavedIdioms,
  fetchSRSData,
  updateSRSProgress,
} from "@/services/api/userDataService";
import type { Idiom } from "@/types";
import { toast } from "@/libs/Toast";
import { loadingService } from "@/libs/Loading";

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
  const [loading, setLoading] = useState(true);
  const [srsData, setSrsData] = useState<SRSDataMap>({});
  const [totalAvailableCards, setTotalAvailableCards] = useState(0);

  const loadData = useCallback(
    async (forceReview = false) => {
      setLoading(true);
      try {
        const progressMap: SRSDataMap = {};
        if (isLoggedIn) {
          const srsResponse = await fetchSRSData({ page: 1, limit: 500 });
          srsResponse.data.forEach((item: any) => {
            progressMap[item.idiom.hanzi] = {
              interval: item.interval,
              repetition: item.repetition,
              efactor: item.efactor,
              nextReviewDate: Number(item.nextReviewDate),
            };
          });
        } else {
          // GUEST MODE: Load from localStorage
          const localData = getLocalSRS();
          Object.assign(progressMap, localData);
        }
        setSrsData(progressMap);

        let allCards: Idiom[] = [];
        if (source === "saved") {
          const savedRes = await fetchSavedIdioms({ page: 1, limit: 1000 });
          allCards = savedRes.data;
        } else {
          // Pass QueryParams object
          const response = await fetchStoredIdioms({ page: 1, limit: 1000 });
          allCards = response.data;
        }
        setTotalAvailableCards(allCards.length);

        let queue: Idiom[] = [];
        if (forceReview) {
          queue = allCards.sort(() => 0.5 - Math.random()).slice(0, 20);
        } else {
          const now = Date.now();
          const dueCards = allCards.filter((card) => {
            const progress = progressMap[card.hanzi];
            if (!progress) return true;
            return progress.nextReviewDate <= now;
          });
          dueCards.sort((a, b) => {
            const progA = progressMap[a.hanzi]?.nextReviewDate || 0;
            const progB = progressMap[b.hanzi]?.nextReviewDate || 0;
            return progA - progB;
          });
          queue = dueCards.slice(0, 20);
        }
        setReviewQueue(queue);
      } catch (e) {
        toast.error("Không thể tải dữ liệu học tập.");
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn, source]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (reviewQueue.length > 0) {
      setCurrentCard(reviewQueue[0]);
    } else {
      setCurrentCard(null);
    }
  }, [reviewQueue]);

  const handleRate = async (quality: number) => {
    if (!currentCard || !currentCard.id) return;

    loadingService.show("Đang đồng bộ...");
    try {
      if (isLoggedIn) {
        const result = await updateSRSProgress(currentCard.id, { quality });

        // Update local SRS data with the result from backend
        setSrsData((prev) => ({
          ...prev,
          [currentCard.hanzi]: {
            interval: result.interval,
            repetition: result.repetition,
            efactor: result.efactor,
            nextReviewDate: Number(result.nextReviewDate),
          },
        }));
      } else {
        // GUEST MODE: Calculate SM-2 locally
        const existing = srsData[currentCard.hanzi] || {
          interval: 0,
          repetition: 0,
          efactor: 2.5,
          nextReviewDate: Date.now(),
        };

        const q = quality;
        let { interval, repetition, efactor } = existing;

        if (q >= 3) {
          if (repetition === 0) {
            // Special case: Easy (5) for new card jumps further
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

        setSrsData((prev) => ({
          ...prev,
          [currentCard.hanzi]: newProgress,
        }));
      }

      // If quality is low, move to end of queue instead of removing
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
    const existing = srsData[currentCard.hanzi] || {
      interval: 0,
      repetition: 0,
      efactor: 2.5,
    };

    if (quality < 3) return "1 phút";

    let interval = 0;
    if (existing.repetition === 0) {
      if (quality === 3) interval = 1;
      else if (quality === 4) interval = 2; // Better for Good
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
