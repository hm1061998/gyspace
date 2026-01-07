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

  const handleRate = async (rating: 1 | 2 | 3) => {
    if (!currentCard || !currentCard.id) return;

    loadingService.show("Đang đồng bộ...");
    try {
      const existing = srsData[currentCard.hanzi] || {
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: 0,
      };
      let { interval, repetition, efactor } = existing;
      let nextReviewDate = Date.now();

      if (rating === 1) {
        repetition = 0;
        interval = 0;
        try {
          await updateSRSProgress(currentCard.id, {
            interval,
            repetition,
            efactor,
            nextReviewDate,
          });
        } catch (err) {
          console.error("SRS sync error", err);
        }

        setSrsData((prev) => ({
          ...prev,
          [currentCard.hanzi]: {
            interval,
            repetition,
            efactor,
            nextReviewDate,
          },
        }));
        setReviewQueue((prev) => [...prev.slice(1), currentCard]);
        return;
      }

      if (repetition === 0) interval = 1;
      else if (repetition === 1) interval = 6;
      else interval = Math.round(interval * efactor);

      if (rating === 3) {
        efactor += 0.15;
        interval = Math.round(interval * 1.3);
      }
      if (efactor < 1.3) efactor = 1.3;
      repetition += 1;
      nextReviewDate += interval * 24 * 60 * 60 * 1000;

      try {
        await updateSRSProgress(currentCard.id, {
          interval,
          repetition,
          efactor,
          nextReviewDate,
        });
      } catch (err) {
        console.error("SRS sync error", err);
      }
      setSrsData((prev) => ({
        ...prev,
        [currentCard.hanzi]: { interval, repetition, efactor, nextReviewDate },
      }));
      setReviewQueue((prev) => prev.slice(1));
    } finally {
      loadingService.hide();
    }
  };

  const getNextIntervalLabel = (rating: 1 | 2 | 3) => {
    if (!currentCard) return "";
    const existing = srsData[currentCard.hanzi] || {
      interval: 0,
      repetition: 0,
      efactor: 2.5,
    };
    if (rating === 1) return "< 1m";
    let interval = 1;
    if (existing.repetition === 0) interval = 1;
    else if (existing.repetition === 1) interval = 6;
    else interval = Math.round(existing.interval * existing.efactor);
    if (rating === 3) interval = Math.round(interval * 1.5);
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
