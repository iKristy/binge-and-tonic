import { Show } from "@/types/Show";

// TMDB series-level status values that mean no further episodes will ever air.
const FINISHED_SERIES_STATUSES = ["ended", "canceled", "cancelled"];

// TMDB series-level status values that mean more episodes are still expected
// (the show is ongoing, renewed, or has a new season in the pipeline).
const RETURNING_SERIES_STATUSES = [
  "returning series",
  "in production",
  "planned",
  "pilot",
];

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

/**
 * A show has an upcoming season only while it is in the pre-release state: TMDB
 * marks it as returning/ongoing, the season has a known episode count, but none
 * of its episodes have aired yet. As soon as the first episode airs the show
 * moves to normal progress tracking, so this is purely the "announced but not
 * airing yet" window (not the gap after a season has finished airing).
 */
export const hasUpcomingSeason = (show: Show): boolean => {
  const status = show.seriesStatus?.trim().toLowerCase();
  if (!status || !RETURNING_SERIES_STATUSES.includes(status)) return false;
  if (isSeriesFinished(show)) return false;
  return show.totalEpisodes > 0 && show.releasedEpisodes === 0;
};

export type ShowBadgeVariant = "finished" | "complete" | "inProgress" | "announced";

export interface ShowBadge {
  variant: ShowBadgeVariant;
  label: string;
}

/**
 * Derives the status badge (label + color variant) shown on cards and details.
 * Precedence: finished series → new season announced (pre-release) → season
 * completed → episodes remaining.
 */
export const getShowBadge = (show: Show): ShowBadge => {
  if (isSeriesFinished(show)) {
    return { variant: "finished", label: "Finished series" };
  }

  // Only true before the upcoming season starts airing; once episodes drop the
  // show falls through to the progress/completed states below.
  if (hasUpcomingSeason(show)) {
    return { variant: "announced", label: "New season" };
  }

  const isComplete =
    show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes;
  if (isComplete) {
    return { variant: "complete", label: "Season completed" };
  }

  const remainingEpisodes = Math.max(0, show.totalEpisodes - show.releasedEpisodes);
  return {
    variant: "inProgress",
    label: `${remainingEpisodes} episode${remainingEpisodes !== 1 ? "s" : ""} remaining`,
  };
};
