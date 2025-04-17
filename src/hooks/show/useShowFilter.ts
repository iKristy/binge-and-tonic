
import { useState } from "react";
import { Show } from "@/types/Show";

export type FilterType = "all" | "complete" | "waiting";

export function useShowFilter(shows: Show[]) {
  const [filter, setFilter] = useState<FilterType>("all");
  
  const filteredShows = shows.filter((show) => {
    if (filter === "all") return true;
    if (filter === "complete") return show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes;
    return show.status === "waiting" && show.releasedEpisodes < show.totalEpisodes;
  });
  
  const completeCount = shows.filter(show => 
    show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes
  ).length;
  
  const waitingCount = shows.length - completeCount;
  const totalCount = shows.length;

  return {
    filter,
    setFilter,
    filteredShows,
    completeCount,
    waitingCount,
    totalCount
  };
}
