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

/**
 * A show has an upcoming season only while it is in the pre-release state: TMDB
 * has a concretely scheduled first episode of a season newer than the one we
 * currently track (`nextSeasonAirDate`), and that date is still in the future.
 * As soon as the new season starts airing the date passes (and the tracked
 * season advances), so this is purely the "announced but not airing yet"
 * window, not the gap after a season has simply finished airing.
 */
export const hasUpcomingSeason = (show: Show): boolean => {
  if (isSeriesFinished(show)) return false;
  if (!show.nextSeasonAirDate) return false;
  return new Date(show.nextSeasonAirDate).getTime() > Date.now();
};

/**
 * A show is "ready to binge" when its currently tracked season is fully
 * released and it isn't merely waiting on an announced-but-unaired new season.
 * A "New season" (pre-release) show has all of its current episodes out but
 * nothing fresh to watch yet, so it's treated as "waiting for episodes".
 */
export const isReadyToBinge = (show: Show): boolean => {
  if (hasUpcomingSeason(show)) return false;
  return show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes;
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
    return { variant: "announced", label: "New season coming" };
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
