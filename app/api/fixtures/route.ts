import { NextResponse } from 'next/server'
import { db } from '@/db'
import { fixtures } from '@/db/schema'
import { gte, lte, and, notInArray } from 'drizzle-orm'

function getFixtureWindow(date: Date): { start: Date; end: Date } {
  const day = date.getUTCDay()
  const base = new Date(date)
  base.setUTCHours(0, 0, 0, 0)

  if ([5, 6, 0, 1].includes(day)) {
    const daysFromFriday = (day - 5 + 7) % 7
    const start = new Date(base)
    start.setUTCDate(base.getUTCDate() - daysFromFriday)
    const end = new Date(start)
    end.setUTCDate(start.getUTCDate() + 3)
    end.setUTCHours(23, 59, 59, 999)
    return { start, end }
  } else {
    const daysFromTuesday = (day - 2 + 7) % 7
    const start = new Date(base)
    start.setUTCDate(base.getUTCDate() - daysFromTuesday)
    const end = new Date(start)
    end.setUTCDate(start.getUTCDate() + 2)
    end.setUTCHours(23, 59, 59, 999)
    return { start, end }
  }
}

const EXCLUDED_STATUSES = ['FINISHED', 'CANCELLED', 'POSTPONED'] as const
const EXCLUDED_COMPETITIONS = ['ELC'] as const

// GET /api/fixtures — upcoming fixtures for the current fixture window
export async function GET() {
  const now = new Date()

  const [next] = await db
    .select({ matchDate: fixtures.matchDate })
    .from(fixtures)
    .where(
      and(
        gte(fixtures.matchDate, now),
        notInArray(fixtures.status, [...EXCLUDED_STATUSES]),
        notInArray(fixtures.competition, [...EXCLUDED_COMPETITIONS]),
      ),
    )
    .orderBy(fixtures.matchDate)
    .limit(1)

  if (!next) return NextResponse.json([])

  const { start, end } = getFixtureWindow(next.matchDate)

  const rows = await db
    .select()
    .from(fixtures)
    .where(
      and(
        gte(fixtures.matchDate, start),
        lte(fixtures.matchDate, end),
        notInArray(fixtures.status, [...EXCLUDED_STATUSES]),
        notInArray(fixtures.competition, [...EXCLUDED_COMPETITIONS]),
      ),
    )
    .orderBy(fixtures.matchDate)

  return NextResponse.json(rows)
}
