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
}
