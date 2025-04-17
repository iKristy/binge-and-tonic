
import { User } from "@supabase/supabase-js";
import { useShowFetch } from "@/hooks/show/useShowFetch";
import { useShowFilter, FilterType } from "@/hooks/show/useShowFilter";
import { useShowStorage } from "@/hooks/show/useShowStorage";
import { Show } from "@/types/Show";

export type { FilterType } from "@/hooks/show/useShowFilter";

export function useShowsData(user: User | null) {
  const { shows, setShows, isLoading } = useShowFetch(user);
  const { filter, setFilter, filteredShows, completeCount, waitingCount, totalCount } = useShowFilter(shows);
  const { isShowAlreadyAdded, addShow: addShowToStorage, removeShow: removeShowFromStorage } = useShowStorage(user);

  const addShow = async (newShow: Omit<Show, "id" | "status">) => {
    return addShowToStorage(shows, setShows, newShow);
  };

  const removeShow = async (showId: string) => {
    return removeShowFromStorage(shows, setShows, showId);
  };

  return {
    shows,
    filteredShows,
    isLoading,
    filter,
    setFilter,
    addShow,
    removeShow,
    completeCount,
    waitingCount,
    totalCount,
    isShowAlreadyAdded: (tmdbId: number) => isShowAlreadyAdded(shows, tmdbId)
  };
}
