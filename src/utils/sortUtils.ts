
import { Show } from "@/types/Show";

/**
 * Sort shows alphabetically by title
 */
export const sortAlphabetically = (a: Show, b: Show): number => {
  return a.title.localeCompare(b.title);
};

/**
 * Sort shows by status (complete first, then waiting)
 * with secondary alphabetical sorting
 */
export const sortByStatus = (a: Show, b: Show): number => {
  // Sort complete shows first, then waiting
  if (a.status === "complete" && b.status !== "complete") return -1;
  if (a.status !== "complete" && b.status === "complete") return 1;
  return sortAlphabetically(a, b); // Secondary sort by title
};

/**
 * Sort shows by release date (based on remaining episodes)
 * with secondary alphabetical sorting
 */
export const sortByReleaseDate = (a: Show, b: Show): number => {
  // Sort by remaining episodes (fewer remaining episodes = newer release date)
  const aRemainingEpisodes = a.totalEpisodes - a.releasedEpisodes;
  const bRemainingEpisodes = b.totalEpisodes - b.releasedEpisodes;
  if (aRemainingEpisodes !== bRemainingEpisodes) {
    return aRemainingEpisodes - bRemainingEpisodes;
  }
  return sortAlphabetically(a, b); // Secondary sort by title
};

/**
 * Placeholder for date added sorting
 * The actual implementation will be handled in the storage hook
 */
export const sortByDateAdded = (a: Show, b: Show): number => {
  // This is a placeholder - actual sorting is determined by array order
  return 0;
};
