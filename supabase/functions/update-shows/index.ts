
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

    // Get shows to update with improved prioritization:
    // 1. Shows that have never been updated (updated_at is null or very old)
    // 2. Shows with low retry count
    // 3. Shows that haven't been updated in the longest time
    // Limit to 50 shows to process more efficiently
    const { data: shows, error: fetchError } = await supabase
      .from("shows")
      .select("id, tmdb_id, title, total_episodes, released_episodes, season_number, retry_count, last_error")
      .or("updated_at.is.null,updated_at.lt.2024-01-01,retry_count.lt.3")
      .order("updated_at", { ascending: true, nullsFirst: true })
      .order("retry_count", { ascending: true })
      .limit(50);

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

    // Process shows in smaller batches to avoid rate limiting
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < shows.length; i += batchSize) {
      batches.push(shows.slice(i, i + batchSize));
    }

    let totalUpdates = 0;
    let totalErrors = 0;
    const allUpdates = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} shows`);

      // Process batch with a small delay between API calls
      const batchUpdates = await Promise.all(
        batch.map(async (show, index) => {
          // Add a small delay between requests to respect rate limits
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }

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
                updated_at: new Date().toISOString(),
                retry_count: 0, // Reset retry count on successful update
                last_error: null // Clear any previous errors
              })
              .eq("id", show.id);

            if (updateError) {
              throw new Error(`Error updating show ${show.title}: ${updateError.message}`);
            }

            console.log(`Successfully updated ${show.title} - Released: ${releasedEpisodes}/${latestSeason?.episode_count || showDetails.number_of_episodes}`);

            return {
              id: show.id,
              title: show.title,
              updated: true,
              releasedEpisodes,
              totalEpisodes: latestSeason?.episode_count || showDetails.number_of_episodes
            };
          } catch (error) {
            console.error(`Error updating show ${show.tmdb_id} (${show.title}):`, error);
            totalErrors++;
            
            // Update retry count and error message
            const retryCount = (show.retry_count || 0) + 1;
            await supabase
              .from("shows")
              .update({
                updated_at: new Date().toISOString(),
                retry_count: retryCount,
                last_error: error instanceof Error ? error.message : String(error)
              })
              .eq("id", show.id);
              
            return {
              id: show.id,
              title: show.title,
              updated: false,
              error: error instanceof Error ? error.message : String(error),
              retryCount
            };
          }
        })
      );

      allUpdates.push(...batchUpdates);
      totalUpdates += batchUpdates.filter(u => u.updated).length;

      // Add a longer delay between batches
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successMessage = `Updated ${totalUpdates}/${shows.length} shows successfully`;
    if (totalErrors > 0) {
      console.log(`${successMessage}. ${totalErrors} shows had errors and will be retried later.`);
    } else {
      console.log(successMessage);
    }

    return new Response(
      JSON.stringify({
        message: successMessage,
        totalProcessed: shows.length,
        totalUpdated: totalUpdates,
        totalErrors: totalErrors,
        details: allUpdates
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
