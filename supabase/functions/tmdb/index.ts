
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the API key from Supabase secrets
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) {
      return new Response(
        JSON.stringify({ error: "TMDB API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const TMDB_BASE_URL = "https://api.themoviedb.org/3";
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    
    if (!path) {
      return new Response(
        JSON.stringify({ error: "No path provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Build the TMDb URL with the path and API key
    const tmdbUrl = `${TMDB_BASE_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`;
    
    console.log(`Fetching from TMDb: ${path}`);
    
    // Forward the request to TMDb
    const response = await fetch(tmdbUrl);
    const data = await response.json();

    // Return the response from TMDb
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in TMDb function:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
