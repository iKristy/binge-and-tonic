
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") || '';
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: string;
  path: string;
}

serve(async (req) => {
  console.log('TMDB Edge Function received request');
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }
  
  // Check API key first
  if (!TMDB_API_KEY) {
    console.error('API key not configured');
    return new Response(JSON.stringify({ 
      error: 'TMDB API key not configured', 
      details: 'Please set TMDB_API_KEY in your Edge Function secrets'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
  
  // Parse the request body
  let body: RequestBody;
  try {
    const bodyText = await req.text();
    console.log('Request body (raw):', bodyText);
    
    if (!bodyText) {
      throw new Error('Empty request body');
    }
    
    body = JSON.parse(bodyText);
    console.log('Request body (parsed):', JSON.stringify(body));
  } catch (error) {
    console.error('Invalid JSON in request body:', error);
    return new Response(JSON.stringify({ 
      error: 'Invalid request body',
      details: error instanceof Error ? error.message : 'Could not parse JSON'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }

  if (!body.action || !body.path) {
    console.error('Missing required parameters');
    return new Response(JSON.stringify({ 
      error: 'Missing required parameters',
      details: 'Both action and path are required'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data from TMDb', 
      details: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})
