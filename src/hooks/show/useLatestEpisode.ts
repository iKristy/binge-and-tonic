import { useState, useEffect } from "react";
import { LatestEpisode } from "@/types/Show";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZjY5NTY3MDQwN2U4ZGZlMzFiYWEzOWZjNzA5M2Q0MSIsIm5iZiI6MTczOTcxMzA4My44NDksInN1YiI6IjY3NjFmYjkzNzI5ZjZmNjMyMzg0ZGJjZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xaC0xKGsGnLpBaQCxtUxE6KZ3Z6LJjMcFfm9QHGhJyk";

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

        const seasonDetailsUrl = `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=en-US`;
        const response = await fetch(seasonDetailsUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch season details: ${response.status}`);
        }
        
        const seasonDetails = await response.json();
        
        // Find the latest aired episode
        const today = new Date();
        const airedEpisodes = seasonDetails.episodes?.filter((episode: any) => {
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