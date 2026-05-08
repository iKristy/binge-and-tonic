import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase-client.ts";

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STALE_HOURS = 6;
const MAX_RETRIES = 5;
const BATCH_LIMIT = 50;

async function refreshShow(show: any) {
  const today = new Date();

  const showDetailsUrl = `${TMDB_BASE_URL}/tv/${show.tmdb_id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=seasons`;
  const showResponse = await fetch(showDetailsUrl);
  if (!showResponse.ok) {
    throw new Error(`TMDB API returned ${showResponse.status} for show ${show.tmdb_id}`);
  }
  const showDetails = await showResponse.json();

  const airedSeasons = (showDetails.seasons || []).filter((season: any) => {
    if (season.season_number === 0) return false;
    if (!season.air_date) return false;
    return new Date(season.air_date) <= today;
  });

  const latestAiredSeason = airedSeasons.sort(
    (a: any, b: any) => b.season_number - a.season_number
  )[0];
  const seasonNumber = latestAiredSeason?.season_number || show.season_number || 1;

  const seasonDetailsUrl = `${TMDB_BASE_URL}/tv/${show.tmdb_id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=en-US`;
  const seasonResponse = await fetch(seasonDetailsUrl);
  if (!seasonResponse.ok) {
    throw new Error(`TMDB API returned ${seasonResponse.status} for season details`);
  }
  const seasonDetails = await seasonResponse.json();

  const releasedEpisodes =
    seasonDetails.episodes?.filter((episode: any) => {
      if (!episode.air_date) return false;
      return new Date(episode.air_date) <= today;
    }).length || 0;

  const totalEpisodes =
    latestAiredSeason?.episode_count ||
    showDetails.number_of_episodes ||
    show.total_episodes;

  const { error: updateError } = await supabase
    .from("shows")
    .update({
      season_number: seasonNumber,
      released_episodes: releasedEpisodes,
      total_episodes: totalEpisodes,
      updated_at: new Date().toISOString(),
      retry_count: 0,
      last_error: null,
    })
    .eq("id", show.id);

  if (updateError) {
    throw new Error(`Error updating show ${show.title}: ${updateError.message}`);
  }

  return {
    id: show.id,
    title: show.title,
    updated: true,
    seasonNumber,
    releasedEpisodes,
    totalEpisodes,
  };
}

async function recordFailure(show: any, error: unknown) {
  const retryCount = (show.retry_count || 0) + 1;
  await supabase
    .from("shows")
    .update({
      updated_at: new Date().toISOString(),
      retry_count: retryCount,
      last_error: error instanceof Error ? error.message : String(error),
    })
    .eq("id", show.id);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (!TMDB_API_KEY) {
    return new Response(
      JSON.stringify({ error: "TMDB API key not configured" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  // Parse optional payload (e.g. { tmdbId } or { showId } for single-show refresh)
  let payload: any = {};
  try {
    if (req.method !== "GET") payload = await req.json();
  } catch (_) {
    payload = {};
  }

  try {
    // ---------- Single-show on-demand refresh ----------
    if (payload?.tmdbId || payload?.showId) {
      let query = supabase
        .from("shows")
        .select("id, tmdb_id, title, total_episodes, released_episodes, season_number, retry_count, last_error")
        .limit(1);

      if (payload.tmdbId) query = query.eq("tmdb_id", payload.tmdbId);
      else query = query.eq("id", payload.showId);

      const { data: rows, error } = await query;
      if (error) throw new Error(error.message);
      const show = rows?.[0];
      if (!show) {
        return new Response(JSON.stringify({ error: "Show not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      try {
        const result = await refreshShow(show);
        return new Response(JSON.stringify({ message: "Show refreshed", show: result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (err) {
        await recordFailure(show, err);
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }

    // ---------- Batch refresh of stale shows ----------
    const staleCutoff = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000).toISOString();

    const { data: shows, error: fetchError } = await supabase
      .from("shows")
      .select("id, tmdb_id, title, total_episodes, released_episodes, season_number, retry_count, last_error")
      .or(`updated_at.is.null,updated_at.lt.${staleCutoff}`)
      .lt("retry_count", MAX_RETRIES)
      .order("updated_at", { ascending: true, nullsFirst: true })
      .limit(BATCH_LIMIT);

    if (fetchError) {
      throw new Error(`Error fetching shows: ${fetchError.message}`);
    }

    if (!shows || shows.length === 0) {
      return new Response(JSON.stringify({ message: "No shows to update" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Refreshing ${shows.length} stale shows`);

    const batchSize = 10;
    let totalUpdated = 0;
    let totalErrors = 0;
    const allResults: any[] = [];

    for (let i = 0; i < shows.length; i += batchSize) {
      const batch = shows.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (show, idx) => {
          if (idx > 0) await new Promise((r) => setTimeout(r, 200));
          try {
            const r = await refreshShow(show);
            totalUpdated++;
            return r;
          } catch (err) {
            totalErrors++;
            await recordFailure(show, err);
            return {
              id: show.id,
              title: show.title,
              updated: false,
              error: err instanceof Error ? err.message : String(err),
            };
          }
        })
      );
      allResults.push(...results);
      if (i + batchSize < shows.length) await new Promise((r) => setTimeout(r, 1000));
    }

    return new Response(
      JSON.stringify({
        message: `Updated ${totalUpdated}/${shows.length} shows`,
        totalProcessed: shows.length,
        totalUpdated,
        totalErrors,
        details: allResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in update-shows function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update shows",
        details: error instanceof Error ? error.message : String(error),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
