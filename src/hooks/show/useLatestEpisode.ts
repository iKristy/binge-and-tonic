import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LatestEpisode } from "@/types/Show";
import { supabase } from "@/integrations/supabase/client";

export const latestEpisodeQueryKey = (
  tmdbId: number | undefined,
  seasonNumber: number | undefined
) => ["latestEpisode", tmdbId ?? null, seasonNumber ?? null] as const;

async function fetchLatestEpisode(
  tmdbId: number,
  seasonNumber: number
): Promise<LatestEpisode | null> {
  const { data, error: functionError } = await supabase.functions.invoke("tmdb", {
    body: {
      action: "season",
      path: `/tv/${tmdbId}/season/${seasonNumber}?language=en-US`,
    },
  });

  if (functionError) {
    throw new Error(`Failed to fetch season details: ${functionError.message}`);
  }
  if (!data) {
    throw new Error("No data returned from TMDB API");
  }

  const today = new Date();
  const airedEpisodes =
    data.episodes?.filter((episode: any) => {
      if (!episode.air_date) return false;
      return new Date(episode.air_date) <= today;
    }) || [];

  if (airedEpisodes.length === 0) {
    return null;
  }

  const latest = airedEpisodes.reduce((prev: any, current: any) =>
    current.episode_number > prev.episode_number ? current : prev
  );

  return {
    episodeNumber: latest.episode_number,
    name: latest.name,
    airDate: latest.air_date,
    overview: latest.overview,
  };
}

// Episodes rarely change, so keep results cached long enough that reopening a
// show's details renders instantly without a layout shift.
const STALE_TIME = 1000 * 60 * 30;
const GC_TIME = 1000 * 60 * 60;

export function useLatestEpisode(
  tmdbId: number | undefined,
  seasonNumber: number | undefined
) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: latestEpisodeQueryKey(tmdbId, seasonNumber),
    queryFn: () => fetchLatestEpisode(tmdbId as number, seasonNumber as number),
    enabled: !!tmdbId && !!seasonNumber,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  return {
    latestEpisode: data ?? null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

/**
 * Returns a function that warms the latest-episode cache ahead of time (e.g. on
 * card hover/focus) so the detail modal has data ready and doesn't shift.
 */
export function usePrefetchLatestEpisode() {
  const queryClient = useQueryClient();

  return (tmdbId: number | undefined, seasonNumber: number | undefined) => {
    if (!tmdbId || !seasonNumber) return;
    queryClient.prefetchQuery({
      queryKey: latestEpisodeQueryKey(tmdbId, seasonNumber),
      queryFn: () => fetchLatestEpisode(tmdbId, seasonNumber),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  };
}
