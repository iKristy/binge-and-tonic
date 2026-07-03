import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface AddShowBody {
  tmdbId: number
  title: string
  posterUrl?: string | null
  totalEpisodes: number
  releasedEpisodes: number
  seasonNumber: number
}

function validate(body: unknown): { ok: true; data: AddShowBody } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' }
  const b = body as Record<string, unknown>
  const tmdbId = Number(b.tmdbId)
  const title = typeof b.title === 'string' ? b.title.trim() : ''
  const totalEpisodes = Number(b.totalEpisodes)
  const releasedEpisodes = Number(b.releasedEpisodes)
  const seasonNumber = Number(b.seasonNumber)
  const posterUrl = b.posterUrl == null ? null : String(b.posterUrl)

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) return { ok: false, error: 'tmdbId must be a positive integer' }
  if (!title || title.length > 500) return { ok: false, error: 'title required, max 500 chars' }
  if (!Number.isInteger(totalEpisodes) || totalEpisodes < 0 || totalEpisodes > 100000) return { ok: false, error: 'totalEpisodes invalid' }
  if (!Number.isInteger(releasedEpisodes) || releasedEpisodes < 0 || releasedEpisodes > 100000) return { ok: false, error: 'releasedEpisodes invalid' }
  if (!Number.isInteger(seasonNumber) || seasonNumber < 0 || seasonNumber > 1000) return { ok: false, error: 'seasonNumber invalid' }
  if (posterUrl && posterUrl.length > 2000) return { ok: false, error: 'posterUrl too long' }

  return { ok: true, data: { tmdbId, title, posterUrl, totalEpisodes, releasedEpisodes, seasonNumber } }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authed = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsErr } = await authed.auth.getClaims(token)
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const parsed = validate(await req.json().catch(() => null))
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const input = parsed.data

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Look up existing catalog row for this tmdb_id.
    const { data: existing, error: findErr } = await admin
      .from('shows')
      .select('id')
      .eq('tmdb_id', input.tmdbId)
      .maybeSingle()

    if (findErr) throw findErr

    let showId: number
    if (existing) {
      showId = existing.id
    } else {
      const { data: inserted, error: insertErr } = await admin
        .from('shows')
        .insert({
          tmdb_id: input.tmdbId,
          title: input.title,
          poster_url: input.posterUrl,
          total_episodes: input.totalEpisodes,
          released_episodes: input.releasedEpisodes,
          season_number: input.seasonNumber,
        })
        .select('id')
        .single()
      if (insertErr) throw insertErr
      showId = inserted.id
    }

    return new Response(JSON.stringify({ showId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('add-show error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
