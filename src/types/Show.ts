
export interface Show {
  id: string;
  title: string;
  imageUrl: string;
  currentEpisodes: number;
  episodesNeeded: number;
  status: 'ready' | 'waiting';
  description?: string;
  genre?: string;
  tmdbId?: number;
}
