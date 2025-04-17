
import { useState, useEffect } from "react";
import { searchShows, TMDbShow, getShowDetails } from "@/services/tmdbApi";
import { useToast } from "@/hooks/use-toast";

export function useShowSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDbShow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>();
  const [selectedShow, setSelectedShow] = useState<TMDbShow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        setSearchError(undefined);
        
        try {
          console.log("Searching for:", searchQuery);
          const results = await searchShows(searchQuery);
          console.log("Search results:", results);
          
          // Ensure results are sorted by popularity (just in case the API doesn't do it properly)
          const sortedResults = results.results?.sort((a, b) => 
            (b.popularity || 0) - (a.popularity || 0)
          ) || [];
          
          setSearchResults(sortedResults);
        } catch (error: any) {
          console.error("Search error:", error);
          setSearchError(error.message || "Failed to search shows");
          setSearchResults([]);
          
          toast({
            title: "Search Error",
            description: error.message || "Failed to search shows",
            variant: "destructive"
          });
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSearchError(undefined);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, toast]);

  const fetchShowDetails = async (show: TMDbShow) => {
    setIsLoading(true);
    try {
      const details = await getShowDetails(show.id);
      if (details) {
        setSelectedShow({
          ...show,
          ...details
        });
        return details;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching show details:", error);
      toast({
        title: "Error",
        description: `Couldn't fetch show details: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowSelect = async (show: TMDbShow) => {
    setSelectedShow(show);
    await fetchShowDetails(show);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(undefined);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,
    selectedShow,
    setSelectedShow,
    isLoading,
    handleShowSelect,
    handleSearchClear
  };
}
