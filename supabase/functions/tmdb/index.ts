
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") || '';
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface RequestBody {
  action: string;
  path: string;
}

serve(async (req) => {
  console.log('TMDB Edge Function received request');
  
  // Check API key first
  if (!TMDB_API_KEY) {
    console.error('API key not configured');
    return new Response(JSON.stringify({ 
      error: 'TMDB API key not configured', 
      details: 'Please set TMDB_API_KEY in your Edge Function secrets'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
  
  // Parse the request body
  let body: RequestBody;
  try {
    body = await req.json();
    console.log('Request body:', JSON.stringify(body));
  } catch (error) {
    console.error('Invalid JSON in request body:', error);
    return new Response(JSON.stringify({ 
      error: 'Invalid request body',
      details: 'Could not parse JSON'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }

  if (!body.action || !body.path) {
    console.error('Missing required parameters');
    return new Response(JSON.stringify({ 
      error: 'Missing required parameters',
      details: 'Both action and path are required'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
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
        url = `${TMDB_BASE_URL}${body.path}`;
        break;
      default:
        console.error('Invalid action:', body.action);
        return new Response(JSON.stringify({ 
          error: 'Invalid action',
          details: `Action "${body.action}" is not supported`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
    }

    // Add API key
    url += url.includes('?') ? '&' : '?';
    url += `api_key=${TMDB_API_KEY}`;
    
    console.log(`Fetching TMDb API: ${url.replace(TMDB_API_KEY, '[REDACTED]')}`);

    // Make the request to TMDb
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TMDb API returned ${response.status}: ${errorText}`);
      throw new Error(`TMDb API returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('TMDb response received successfully');

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
