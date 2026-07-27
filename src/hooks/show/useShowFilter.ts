
import { useState } from "react";
import { Show } from "@/types/Show";
import { isSeriesFinished } from "@/utils/showStatus";

export type FilterType = "all" | "complete" | "waiting" | "finished";

export function useShowFilter(shows: Show[]) {
  const [filter, setFilter] = useState<FilterType>("all");
  
  const filteredShows = shows.filter((show) => {
    if (filter === "all") return true;
    if (filter === "finished") return isSeriesFinished(show);
    if (filter === "complete") return show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes;
    return show.status === "waiting" && show.releasedEpisodes < show.totalEpisodes;
  });
  
  const completeCount = shows.filter(show => 
    show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes
  ).length;
  
  const finishedCount = shows.filter(isSeriesFinished).length;
  const waitingCount = shows.length - completeCount;
  const totalCount = shows.length;

  return {
    filter,
    setFilter,
    filteredShows,
    completeCount,
    waitingCount,
    finishedCount,
    totalCount
  };
}
