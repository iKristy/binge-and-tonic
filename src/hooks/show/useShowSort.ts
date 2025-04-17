
import { useState } from "react";
import { Show } from "@/types/Show";

export type SortType = "alphabetical" | "status" | "releaseDate" | "dateAdded";

export function useShowSort(shows: Show[]) {
  const [sortBy, setSortBy] = useState<SortType>("alphabetical");
  
  const sortedShows = [...shows].sort((a, b) => {
    switch (sortBy) {
      case "alphabetical":
        return a.title.localeCompare(b.title);
      case "status":
        // Sort complete shows first, then waiting
        if (a.status === "complete" && b.status !== "complete") return -1;
        if (a.status !== "complete" && b.status === "complete") return 1;
        return a.title.localeCompare(b.title); // Secondary sort by title
      case "releaseDate":
        // Sort by remaining episodes (fewer remaining episodes = newer release date)
        const aRemainingEpisodes = a.totalEpisodes - a.releasedEpisodes;
        const bRemainingEpisodes = b.totalEpisodes - b.releasedEpisodes;
        if (aRemainingEpisodes !== bRemainingEpisodes) {
          return aRemainingEpisodes - bRemainingEpisodes;
        }
        return a.title.localeCompare(b.title); // Secondary sort by title
      case "dateAdded":
        // Sort by the order in which shows were added (assuming the first show in the array is the most recently added)
        return 0; // This will be updated in the storage hook
      default:
        return 0;
    }
  });

  return {
    sortBy,
    setSortBy,
    sortedShows,
  };
}
