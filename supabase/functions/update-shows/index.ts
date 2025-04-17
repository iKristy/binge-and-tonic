
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase-client.ts";

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Show {
  id: string;
  tmdb_show_id: number;
  title: string;
  poster_url: string | null;
  total_episodes: number;
  released_episodes: number;
  season_number: number;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Check API key first
  if (!TMDB_API_KEY) {
    console.error("API key not configured");
    return new Response(
      JSON.stringify({
        error: "TMDB API key not configured",
        details: "Please set TMDB_API_KEY in your Edge Function secrets",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }

  try {
    console.log("Starting periodic update of show information");

    // Get shows that need updating (null last_updated_from_tmdb or updated more than a day ago)
    const { data: shows, error: fetchError } = await supabase
      .from("user_shows")
      .select("id, tmdb_show_id, title, poster_url, total_episodes, released_episodes, season_number")
      .or("last_updated_from_tmdb.is.null,last_updated_from_tmdb.lt." + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(20); // Process in batches

    if (fetchError) {
      throw new Error(`Error fetching shows: ${fetchError.message}`);
    }

    console.log(`Found ${shows?.length || 0} shows to update`);

    if (!shows || shows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No shows to update" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Process each show
    const updates = await Promise.all(
      shows.map(async (show) => {
        try {
          // Fetch show details from TMDB
          const showDetailsUrl = `${TMDB_BASE_URL}/tv/${show.tmdb_show_id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=seasons`;
          const showResponse = await fetch(showDetailsUrl);
          
          if (!showResponse.ok) {
            throw new Error(`TMDB API returned ${showResponse.status} for show ${show.tmdb_show_id}`);
          }
          
          const showDetails = await showResponse.json();
          
          // Fetch season details to get accurate episode information
          const latestSeason = showDetails.seasons?.sort((a: any, b: any) => b.season_number - a.season_number)[0];
          const seasonNumber = latestSeason?.season_number || show.season_number || 1;
          
          // Get season details for latest episode count
          const seasonDetailsUrl = `${TMDB_BASE_URL}/tv/${show.tmdb_show_id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=en-US`;
          const seasonResponse = await fetch(seasonDetailsUrl);
          
          if (!seasonResponse.ok) {
            throw new Error(`TMDB API returned ${seasonResponse.status} for season details`);
          }
          
          const seasonDetails = await seasonResponse.json();
          
          // Calculate released episodes based on air dates
          const today = new Date();
          const releasedEpisodes = seasonDetails.episodes?.filter((episode: any) => {
            if (!episode.air_date) return false;
            return new Date(episode.air_date) <= today;
          }).length || 0;

          // Get show overview/description
          const description = showDetails.overview || "";

          // Update the show in the database
          const { error: updateError } = await supabase
            .from("user_shows")
            .update({
              description,
              released_episodes: releasedEpisodes,
              total_episodes: latestSeason?.episode_count || showDetails.number_of_episodes || show.total_episodes,
              last_updated_from_tmdb: new Date().toISOString()
            })
            .eq("id", show.id);

          if (updateError) {
            throw new Error(`Error updating show ${show.title}: ${updateError.message}`);
          }

          return {
            id: show.id,
            title: show.title,
            updated: true
          };
        } catch (error) {
          console.error(`Error updating show ${show.tmdb_show_id}:`, error);
          // Still mark as updated even if there was an error, to avoid repeatedly trying to update failing shows
          await supabase
            .from("user_shows")
            .update({
              last_updated_from_tmdb: new Date().toISOString()
            })
            .eq("id", show.id);
            
          return {
            id: show.id, 
            title: show.title,
            updated: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );

    return new Response(
      JSON.stringify({
        message: `Updated ${updates.filter(u => u.updated).length}/${shows.length} shows`,
        details: updates
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in update-shows function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update shows",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
