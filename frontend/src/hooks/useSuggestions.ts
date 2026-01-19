import React, { useState, useEffect, useRef } from "react";
import { useIdiomSuggestions } from "@/hooks/queries/useIdioms";
import { Idiom } from "@/types";

export const useSuggestions = (query: string, isIdiomSelected: boolean) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsListRef = useRef<HTMLDivElement>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Query
  const { data } = useIdiomSuggestions({ search: debouncedQuery.trim() });

  const suggestions = data?.data || [];

  useEffect(() => {
    if (debouncedQuery.trim() && !isIdiomSelected && suggestions.length > 0) {
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions, debouncedQuery, isIdiomSelected]);

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
    onSelect: (val: string) => void,
  ) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
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
