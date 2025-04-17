
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") || '';
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface RequestBody {
  action: string;
  path: string;
}

serve(async (req) => {
  // Parse the request body
  let body: RequestBody;
  try {
    body = await req.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }

  if (!body.action || !body.path) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }

  if (!TMDB_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }

  try {
    let url: string;
    
    // Handle different actions
    switch(body.action) {
      case 'search':
        url = `${TMDB_BASE_URL}${body.path}`;
        break;
      case 'details':
        // Modified to include seasons info for show details
        url = `${TMDB_BASE_URL}${body.path}`;
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
    }

    // Add API key
    url += url.includes('?') ? '&' : '?';
    url += `api_key=${TMDB_API_KEY}`;

    // Make the request to TMDb
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`TMDb API returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data from TMDb', 
      details: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
})
