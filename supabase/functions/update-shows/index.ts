
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase-client.ts";

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Get shows to update from the shows table - we'll limit to 20 to avoid hitting API rate limits
    const { data: shows, error: fetchError } = await supabase
      .from("shows")
      .select("id, tmdb_id, title, total_episodes, released_episodes, season_number")
      .order("updated_at", { ascending: true })
      .limit(20);

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
          const showDetailsUrl = `${TMDB_BASE_URL}/tv/${show.tmdb_id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=seasons`;
          const showResponse = await fetch(showDetailsUrl);
          
          if (!showResponse.ok) {
            throw new Error(`TMDB API returned ${showResponse.status} for show ${show.tmdb_id}`);
          }
          
          const showDetails = await showResponse.json();
          
          // Fetch season details to get accurate episode information
          const latestSeason = showDetails.seasons?.sort((a: any, b: any) => b.season_number - a.season_number)[0];
          const seasonNumber = latestSeason?.season_number || show.season_number || 1;
          
          // Get season details for latest episode count
          const seasonDetailsUrl = `${TMDB_BASE_URL}/tv/${show.tmdb_id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=en-US`;
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

          // Update the show in the shows table
          const { error: updateError } = await supabase
            .from("shows")
            .update({
              released_episodes: releasedEpisodes,
              total_episodes: latestSeason?.episode_count || showDetails.number_of_episodes || show.total_episodes,
              updated_at: new Date().toISOString()
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
          console.error(`Error updating show ${show.tmdb_id}:`, error);
          // Still mark as updated even if there was an error, to avoid repeatedly trying to update failing shows
          await supabase
            .from("shows")
            .update({
              updated_at: new Date().toISOString()
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
