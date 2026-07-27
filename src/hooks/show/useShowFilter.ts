
import { useState } from "react";
import { Show } from "@/types/Show";
import { isSeriesFinished, isReadyToBinge } from "@/utils/showStatus";

export type FilterType = "all" | "complete" | "waiting" | "finished";

export function useShowFilter(shows: Show[]) {
  const [filter, setFilter] = useState<FilterType>("all");
  
  const filteredShows = shows.filter((show) => {
    if (filter === "all") return true;
    if (filter === "finished") return isSeriesFinished(show);
    if (filter === "complete") return isReadyToBinge(show);
    // "Waiting for episodes" covers anything that isn't ready to binge, which
    // now includes "New season" shows waiting on an announced upcoming season.
    return !isReadyToBinge(show);
  });
  
  const completeCount = shows.filter(isReadyToBinge).length;
  
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
