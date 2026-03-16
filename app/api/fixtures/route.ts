import { NextResponse } from 'next/server'
import { db } from '@/db'
import { fixtures } from '@/db/schema'
import { gte, lte, and, eq } from 'drizzle-orm'

// GET /api/fixtures?groupId=xxx — upcoming fixtures open for prediction
export async function GET() {
  const now = new Date()
  const twoWeeksAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  const rows = await db
    .select()
    .from(fixtures)
    .where(
      and(
        gte(fixtures.matchDate, now),
        lte(fixtures.matchDate, twoWeeksAhead),
        eq(fixtures.status, 'SCHEDULED')
      )
    )
    .orderBy(fixtures.matchDate)

  return NextResponse.json(rows)
}
