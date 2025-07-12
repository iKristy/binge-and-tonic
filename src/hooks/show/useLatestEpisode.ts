import { useState, useEffect } from "react";
import { LatestEpisode } from "@/types/Show";
import { supabase } from "@/integrations/supabase/client";

export function useLatestEpisode(tmdbId: number | undefined, seasonNumber: number | undefined) {
  const [latestEpisode, setLatestEpisode] = useState<LatestEpisode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tmdbId || !seasonNumber) {
      setLatestEpisode(null);
      return;
    }

    const fetchLatestEpisode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use the TMDB edge function to fetch season details
        const { data, error: functionError } = await supabase.functions.invoke('tmdb', {
          body: {
            action: 'season',
            path: `/tv/${tmdbId}/season/${seasonNumber}?language=en-US`
          }
        });

        if (functionError) {
          throw new Error(`Failed to fetch season details: ${functionError.message}`);
        }

        if (!data) {
          throw new Error('No data returned from TMDB API');
        }
        
        // Find the latest aired episode
        const today = new Date();
        const airedEpisodes = data.episodes?.filter((episode: any) => {
          if (!episode.air_date) return false;
          return new Date(episode.air_date) <= today;
        }) || [];
        
        if (airedEpisodes.length > 0) {
          // Get the latest aired episode (highest episode number)
          const latest = airedEpisodes.reduce((prev: any, current: any) => 
            current.episode_number > prev.episode_number ? current : prev
          );
          
          setLatestEpisode({
            episodeNumber: latest.episode_number,
            name: latest.name,
            airDate: latest.air_date,
            overview: latest.overview
          });
        } else {
          setLatestEpisode(null);
        }
      } catch (err: any) {
        console.error("Error fetching latest episode:", err);
        setError(err.message);
        setLatestEpisode(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestEpisode();
  }, [tmdbId, seasonNumber]);

  return { latestEpisode, isLoading, error };
}