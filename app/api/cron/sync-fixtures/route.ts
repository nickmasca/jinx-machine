import { NextResponse } from 'next/server'
import { db } from '@/db'
import { fixtures } from '@/db/schema'
import { eq } from 'drizzle-orm'

const COMPETITIONS = ['PL', 'CL', 'FAC', 'ELC'] as const
const BASE_URL = 'https://api.football-data.org/v4'

interface ApiMatch {
  id: number
  competition: { code: string }
  season: { startDate: string }
  utcDate: string
  matchday: number | null
  status: string
  homeTeam: { name: string | null } | null
  awayTeam: { name: string | null } | null
  score: {
    fullTime: { home: number | null; away: number | null }
  }
}

async function fetchMatches(competition: string): Promise<ApiMatch[]> {
  const res = await fetch(`${BASE_URL}/competitions/${competition}/matches?status=SCHEDULED`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    // Gracefully skip competitions unavailable on the free tier
    console.warn(`football-data.org: ${competition} returned ${res.status}`)
    return []
  }
  const data = (await res.json()) as { matches: ApiMatch[] }
  return data.matches
}

async function fetchRecentFinished(competition: string): Promise<ApiMatch[]> {
  const dateTo = new Date().toISOString().split('T')[0]
  const dateFrom = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const res = await fetch(
    `${BASE_URL}/competitions/${competition}/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
    {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
      next: { revalidate: 0 },
    }
  )
  if (!res.ok) return []
  const data = (await res.json()) as { matches: ApiMatch[] }
  return data.matches
}

export async function GET(req: Request) {
  // Protect cron endpoint
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let synced = 0

  for (const competition of COMPETITIONS) {
    const [scheduled, finished] = await Promise.all([
      fetchMatches(competition),
      fetchRecentFinished(competition),
    ])

    const allMatches = [...scheduled, ...finished]

    for (const match of allMatches) {
      // Skip TBD fixtures (CL knockout stage where teams aren't yet known).
      // football-data.org v4: homeTeam object is always present but name is null when TBD.
      const homeTeamName = match.homeTeam?.name
      const awayTeamName = match.awayTeam?.name
      if (!homeTeamName || !awayTeamName) continue

      const season = match.season.startDate.split('-')[0] // e.g. "2025"
      const row = {
        id: String(match.id),
        competition: match.competition.code,
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        matchDate: new Date(match.utcDate),
        matchday: match.matchday ?? null,
        season,
        homeScore: match.score.fullTime.home ?? null,
        awayScore: match.score.fullTime.away ?? null,
        status: match.status,
        lastUpdated: new Date(),
      }

      await db
        .insert(fixtures)
        .values(row)
        .onConflictDoUpdate({ target: fixtures.id, set: row })

      synced++
    }

    // Respect 10 req/min free-tier rate limit — brief pause between competitions
    await new Promise((r) => setTimeout(r, 700))
  }

  return NextResponse.json({ synced })
}
