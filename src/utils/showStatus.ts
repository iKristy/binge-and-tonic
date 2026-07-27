import { Show } from "@/types/Show";

// TMDB series-level status values that mean no further episodes will ever air.
const FINISHED_SERIES_STATUSES = ["ended", "canceled", "cancelled"];

/**
 * A show counts as a "finished series" when the whole series has concluded on
 * TMDB (Ended/Canceled) and every tracked episode has already aired. This is
 * distinct from "Ready to binge", which only means the current season is fully
 * released (an ongoing series can still be ready to binge).
 */
export const isSeriesFinished = (show: Show): boolean => {
  const status = show.seriesStatus?.trim().toLowerCase();
  if (!status || !FINISHED_SERIES_STATUSES.includes(status)) return false;
  return show.releasedEpisodes >= show.totalEpisodes;
};
