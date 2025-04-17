
// TMDb API service for fetching show information through Supabase Edge Function
import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase.functions.invoke("tmdb", {
      body: { 
        action: "search",
        path: `/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=1` 
      }
    });

    if (error) {
      throw new Error(`Function error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error searching shows:", error);
    return { page: 0, results: [], total_results: 0, total_pages: 0 };
  }
};

export const getShowDetails = async (showId: number): Promise<TMDbShow | null> => {
  try {
    const { data, error } = await supabase.functions.invoke("tmdb", {
      body: { 
        action: "details",
        path: `/tv/${showId}?language=en-US` 
      }
    });
    
    if (error) {
      throw new Error(`Function error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching show details:", error);
    return null;
  }
};

export const getImageUrl = (path: string | null, size: string = "w500"): string => {
  if (!path) return "/placeholder.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
