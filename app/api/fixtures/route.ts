import { NextResponse } from 'next/server'
import { db } from '@/db'
import { fixtures } from '@/db/schema'
import { gte, lte, and, notInArray } from 'drizzle-orm'

function getTwoWindowEnd(date: Date): Date {
  const day = date.getUTCDay()
  const base = new Date(date)
  base.setUTCHours(0, 0, 0, 0)

  if ([5, 6, 0, 1].includes(day)) {
    // Weekend window → extend through next midweek (Thu = Fri + 6)
    const daysFromFriday = (day - 5 + 7) % 7
    const friday = new Date(base)
    friday.setUTCDate(base.getUTCDate() - daysFromFriday)
    const thursday = new Date(friday)
    thursday.setUTCDate(friday.getUTCDate() + 6)
    thursday.setUTCHours(23, 59, 59, 999)
    return thursday
  } else {
    // Midweek window → extend through next weekend (Mon = Tue + 6)
    const daysFromTuesday = (day - 2 + 7) % 7
    const tuesday = new Date(base)
    tuesday.setUTCDate(base.getUTCDate() - daysFromTuesday)
    const monday = new Date(tuesday)
    monday.setUTCDate(tuesday.getUTCDate() + 6)
    monday.setUTCHours(23, 59, 59, 999)
    return monday
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

  const end = getTwoWindowEnd(next.matchDate)

  const rows = await db
    .select()
    .from(fixtures)
    .where(
      and(
        gte(fixtures.matchDate, now),
        lte(fixtures.matchDate, end),
        notInArray(fixtures.status, [...EXCLUDED_STATUSES]),
        notInArray(fixtures.competition, [...EXCLUDED_COMPETITIONS]),
      ),
    )
    .orderBy(fixtures.matchDate)

  return NextResponse.json(rows)
}
