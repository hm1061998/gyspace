import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { useIdiomDetails } from "@/hooks/queries/useIdioms";
import { useAddToHistory } from "@/hooks/queries/useUserData";
import type { Idiom } from "@/types";

export const useIdiomSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Local query state mirrors URL param for immediate UI feedback if needed,
  // but primary source of truth for fetching is URL.
  const searchQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState<string>(searchQuery);

  const { isLoggedIn } = useOutletContext<{ isLoggedIn: boolean }>();

  // Use Query for fetching details
  const {
    data: currentIdiom,
    isLoading,
    error: queryError,
  } = useIdiomDetails(searchQuery, !!searchQuery);

  const error = queryError ? (queryError as Error).message : null;

  // Mutation for history
  const { mutate: addToHistory } = useAddToHistory();

  // Effect to sync URL param to local state (for search bar input)
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  // Effect to add to history when idiom is found
  useEffect(() => {
    if (currentIdiom?.id && isLoggedIn && searchQuery) {
      // We could debounce this or check if it's the same as last time
      addToHistory(currentIdiom.id);
    }
  }, [currentIdiom?.id, isLoggedIn, searchQuery, addToHistory]);

  const handleSearch = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setSearchParams({});
        setQuery("");
        return;
      }
      setSearchParams({ query: searchTerm });
    },
    [setSearchParams],
  );

  return {
    query,
    setQuery,
    currentIdiom,
    isLoading,
    error,
    handleSearch,
    isLoggedIn,
  };
};
