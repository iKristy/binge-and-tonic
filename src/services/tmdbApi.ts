
// TMDb API service for fetching show information through Supabase Edge Function
import { supabase } from "@/integrations/supabase/client";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TMDbSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
}

export interface TMDbShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  last_air_date: string; 
  number_of_episodes: number;
  number_of_seasons: number;
  in_production: boolean;
  status: string;
  genres: Array<{ id: number; name: string }>;
  seasons: TMDbSeason[];
}

export interface TMDbSearchResult {
  page: number;
  results: TMDbShow[];
  total_results: number;
  total_pages: number;
}

export const searchShows = async (query: string): Promise<TMDbSearchResult> => {
  if (!query || query.trim().length < 3) {
    return { page: 0, results: [], total_results: 0, total_pages: 0 };
  }
  
  try {
    console.log(`Searching for shows with query: "${query}"`);
    
    const { data, error } = await supabase.functions.invoke("tmdb", {
      body: { 
        action: "search",
        path: `/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=1` 
      }
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Function error: ${error.message}`);
    }
    
    if (!data) {
      console.error("No data returned from function");
      throw new Error("No data returned from search");
    }

    console.log(`Search results received: ${data.results?.length || 0} shows found`);
    return data;
  } catch (error) {
    console.error("Error searching shows:", error);
    throw error; // Let the caller handle the error
  }
};

export const getShowDetails = async (showId: number): Promise<TMDbShow | null> => {
  if (!showId) return null;
  
  try {
    console.log(`Fetching details for show ID: ${showId}`);
    
    const { data, error } = await supabase.functions.invoke("tmdb", {
      body: { 
        action: "details",
        path: `/tv/${showId}?language=en-US&append_to_response=seasons` 
      }
    });
    
    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Function error: ${error.message}`);
    }
    
    if (!data) {
      console.error("No data returned from function");
      throw new Error("No data returned when fetching show details");
    }
    
    console.log("Show details received successfully");
    return data;
  } catch (error) {
    console.error("Error fetching show details:", error);
    throw error; // Let the caller handle the error
  }
};

export const getImageUrl = (path: string | null, size: string = "w500"): string => {
  if (!path) return "/placeholder.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
