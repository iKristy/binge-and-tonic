export interface LatestEpisode {
  episodeNumber: number;
  name: string;
  airDate: string;
  overview?: string;
}

export interface Show {
  id: string;
  title: string;
  imageUrl: string;
  totalEpisodes: number;
  releasedEpisodes: number;
  status: 'complete' | 'waiting';
  genre?: string;
  tmdbId?: number;
  seasonNumber?: number;
  watched?: boolean; // Ensure this matches the database column
  latestEpisode?: LatestEpisode;
  seriesStatus?: string; // TMDB series-level status, e.g. "Returning Series", "Ended", "Canceled"
  nextSeasonAirDate?: string | null; // Air date of an announced-but-unaired upcoming season (from TMDB next_episode_to_air)
}
