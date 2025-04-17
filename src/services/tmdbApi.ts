
// TMDb API service for fetching show information
const TMDB_API_KEY = "YOUR_API_KEY"; // Replace with your actual TMDb API key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TMDbShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  genres: Array<{ id: number; name: string }>;
}

export interface TMDbSearchResult {
  page: number;
  results: TMDbShow[];
  total_results: number;
  total_pages: number;
}

export const searchShows = async (query: string): Promise<TMDbSearchResult> => {
  if (!query) return { page: 0, results: [], total_results: 0, total_pages: 0 };
  
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching shows:", error);
    return { page: 0, results: [], total_results: 0, total_pages: 0 };
  }
};

export const getShowDetails = async (showId: number): Promise<TMDbShow | null> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch show details');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching show details:", error);
    return null;
  }
};

export const getImageUrl = (path: string | null, size: string = "w500"): string => {
  if (!path) return "/placeholder.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
