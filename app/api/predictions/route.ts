import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { predictions, fixtures, users } from '@/db/schema'
import { and, eq, gte } from 'drizzle-orm'

// GET /api/predictions?groupId=xxx — return current user's predictions for a group
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groupId = req.nextUrl.searchParams.get('groupId')
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 })

  const rows = await db
    .select()
    .from(predictions)
    .where(and(eq(predictions.userId, userId), eq(predictions.groupId, groupId)))

  return NextResponse.json(rows)
}

// POST /api/predictions — submit or update predictions
// Body: { groupId: string, predictions: { fixtureId: string, homeScore: number, awayScore: number }[] }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as {
    groupId: string
    predictions: { fixtureId: string; homeScore: number; awayScore: number }[]
  }

  if (!body.groupId || !Array.isArray(body.predictions)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const now = new Date()

  // Validate: reject predictions for fixtures that have already kicked off
  const fixtureIds = body.predictions.map((p) => p.fixtureId)
  const upcomingFixtures = await db
    .select({ id: fixtures.id })
    .from(fixtures)
    .where(gte(fixtures.matchDate, now))

  const openIds = new Set(upcomingFixtures.map((f) => f.id))
  const locked = fixtureIds.filter((id) => !openIds.has(id))
  if (locked.length > 0) {
    return NextResponse.json(
      { error: 'Predictions locked for started fixtures', locked },
      { status: 422 }
    )
  }

  // Ensure user exists in our DB (lazy create on first prediction)
  const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (existingUser.length === 0) {
    // User hasn't been synced yet — can't create without profile data
    return NextResponse.json(
      { error: 'User profile not set up. Please visit /league first.' },
      { status: 422 }
    )
  }

  const rows = body.predictions.map((p) => ({
    userId,
    groupId: body.groupId,
    fixtureId: p.fixtureId,
    predictedHomeScore: p.homeScore,
    predictedAwayScore: p.awayScore,
  }))

  // Upsert — overwrite existing prediction if resubmitted before kickoff
  for (const row of rows) {
    await db
      .insert(predictions)
      .values(row)
      .onConflictDoUpdate({
        target: [predictions.userId, predictions.groupId, predictions.fixtureId],
        set: {
          predictedHomeScore: row.predictedHomeScore,
          predictedAwayScore: row.predictedAwayScore,
          submittedAt: new Date(),
        },
      })
  }

  return NextResponse.json({ saved: rows.length })
}
