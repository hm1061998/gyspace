import React, { useState, useEffect, useRef } from "react";
import { fetchSuggestions } from "@/services/api/idiomService";
import { Idiom } from "@/types";

export const useSuggestions = (query: string, isIdiomSelected: boolean) => {
  const [suggestions, setSuggestions] = useState<Idiom[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTimer = setTimeout(async () => {
      if (query.trim() && !isIdiomSelected) {
        try {
          const { data } = await fetchSuggestions({ search: query });
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
          setSelectedIndex(-1);
        } catch (err) {
          console.error("Suggestions error:", err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(fetchTimer);
  }, [query, isIdiomSelected]);

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsListRef.current) {
      const selectedElement = suggestionsListRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (
    e: React.KeyboardEvent,
    onSelect: (val: string) => void
  ) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        onSelect(selected.hanzi);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    setSelectedIndex,
    suggestionsListRef,
    handleKeyDown,
  };
};
