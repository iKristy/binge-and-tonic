
import { User } from "@supabase/supabase-js";
import { useShowFetch } from "@/hooks/show/useShowFetch";
import { useShowFilter, FilterType } from "@/hooks/show/useShowFilter";
import { useShowSort, SortType } from "@/hooks/show/useShowSort";
import { useShowStorage } from "@/hooks/show/useShowStorage";
import { Show } from "@/types/Show";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type { FilterType } from "@/hooks/show/useShowFilter";
export type { SortType } from "@/hooks/show/useShowSort";

export function useShowsData(user: User | null) {
  const { shows, setShows, isLoading, refreshShows } = useShowFetch(user);
  const { filter, setFilter, filteredShows, completeCount, waitingCount, totalCount } = useShowFilter(shows);
  const { sortBy, setSortBy, sortedShows } = useShowSort(filteredShows);
  const { isShowAlreadyAdded, addShow: addShowToStorage, removeShow: removeShowFromStorage } = useShowStorage(user);

  const addShow = async (newShow: Omit<Show, "id" | "status">) => {
    return addShowToStorage(shows, setShows, newShow);
  };

  const removeShow = async (showId: string) => {
    return removeShowFromStorage(shows, setShows, showId);
  };

  const toggleWatched = async (showId: string) => {
    const updatedShows = shows.map(show => {
      if (show.id === showId) {
        return { ...show, watched: !show.watched };
      }
      return show;
    });
    
    setShows(updatedShows);
    localStorage.setItem("shows", JSON.stringify(updatedShows));
    
    if (user) {
      try {
        const { error } = await supabase
          .from("user_show_relations")
          .update({ watched: !shows.find(s => s.id === showId)?.watched })
          .eq("id", showId);

        if (error) throw error;
        
        return true;
      } catch (error: any) {
        console.error("Error toggling watched status:", error);
        useToast().toast({
          title: "Failed to update watched status",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };

  return {
    shows,
    filteredShows: sortedShows,
    isLoading,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    addShow,
    removeShow,
    refreshShows,
    completeCount,
    waitingCount,
    totalCount,
    isShowAlreadyAdded: (tmdbId: number) => isShowAlreadyAdded(shows, tmdbId),
    toggleWatched
  };
}
