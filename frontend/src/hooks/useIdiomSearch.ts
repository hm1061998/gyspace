import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import {
  fetchIdiomDetails,
  fetchSuggestions,
} from "@/services/api/idiomService";
import { addToHistory } from "@/services/api/userDataService";
import type { Idiom } from "@/types";

export const useIdiomSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState<string>("");
  const [currentIdiom, setCurrentIdiom] = useState<
    (Idiom & { dataSource: string }) | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useOutletContext<{ isLoggedIn: boolean }>();

  const searchQuery = searchParams.get("query");

  const executeSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setCurrentIdiom(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentIdiom(null);

      try {
        const result = await fetchIdiomDetails(searchTerm);
        setCurrentIdiom(result);
        if (result?.id && isLoggedIn) {
          addToHistory(result.id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoggedIn]
  );

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      executeSearch(searchQuery);
    } else {
      setCurrentIdiom(null);
      setError(null);
    }
  }, [searchQuery, executeSearch]);

  const handleSearch = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setSearchParams({});
        setQuery("");
        return;
      }
      setSearchParams({ query: searchTerm });
    },
    [setSearchParams]
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
