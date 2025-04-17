
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
}
