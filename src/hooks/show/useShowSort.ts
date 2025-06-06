
import { useState, useEffect } from "react";
import { Show } from "@/types/Show";
import {
  sortAlphabetically,
  sortByStatus,
  sortByReleaseDate,
  sortByDateAdded
} from "@/utils/sortUtils";

export type SortType = "alphabetical" | "status" | "releaseDate" | "dateAdded";

export function useShowSort(shows: Show[]) {
  const [sortBy, setSortBy] = useState<SortType>(() => {
    const savedSort = localStorage.getItem("showSort");
    return (savedSort as SortType) || "alphabetical";
  });
  
  useEffect(() => {
    localStorage.setItem("showSort", sortBy);
  }, [sortBy]);

  const getSortFunction = (sortType: SortType) => {
    switch (sortType) {
      case "alphabetical":
        return sortAlphabetically;
      case "status":
        return sortByStatus;
      case "releaseDate":
        return sortByReleaseDate;
      case "dateAdded":
        return sortByDateAdded;
      default:
        return sortAlphabetically;
    }
  };
  
  const sortedShows = [...shows].sort(getSortFunction(sortBy));

  return {
    sortBy,
    setSortBy,
    sortedShows,
  };
}
