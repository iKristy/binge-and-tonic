
import { Show } from "@/types/Show";
import { hasUpcomingSeason } from "@/utils/showStatus";

/**
 * Sort shows alphabetically by title
 */
export const sortAlphabetically = (a: Show, b: Show): number => {
  return a.title.localeCompare(b.title);
};

/**
 * Rank a show for status sorting. Lower ranks sort first.
 * Complete shows come first, then in-progress ("waiting") shows, and shows
 * that are only waiting on an unreleased new season sort last, since there's
 * nothing new to binge yet.
 */
const getStatusRank = (show: Show): number => {
  if (hasUpcomingSeason(show)) return 2;
  const isComplete =
    show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes;
  return isComplete ? 0 : 1;
};

/**
 * Sort shows by status (complete first, then waiting, then new-season shows)
 * with secondary alphabetical sorting
 */
export const sortByStatus = (a: Show, b: Show): number => {
  const rankA = getStatusRank(a);
  const rankB = getStatusRank(b);
  if (rankA !== rankB) return rankA - rankB;
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
