import { NextResponse } from 'next/server'
import { db } from '@/db'
import { fixtures, predictions, predictionScores } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { calcBasePoints, arsenalMultiplier } from '@/lib/scoring'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find finished fixtures that have not yet been scored
  const scoredFixtureIds = db
    .select({ fixtureId: predictionScores.fixtureId })
    .from(predictionScores)

  const unscoredFinished = await db
    .select()
    .from(fixtures)
    .where(
      and(
        eq(fixtures.status, 'FINISHED'),
        // Only fixtures that have at least one prediction but no scores yet
      )
    )

  // Filter to those with no scores recorded yet
  const scoredIds = new Set(
    (await scoredFixtureIds).map((r) => r.fixtureId)
  )
  const toScore = unscoredFinished.filter(
    (f) =>
      f.homeScore !== null &&
      f.awayScore !== null &&
      !scoredIds.has(f.id)
  )

  let calculated = 0

  for (const fixture of toScore) {
    const preds = await db
      .select()
      .from(predictions)
      .where(eq(predictions.fixtureId, fixture.id))

    if (preds.length === 0) continue

    const multiplier = arsenalMultiplier(fixture.homeTeam, fixture.awayTeam)

    const rows = preds.map((pred) => {
      const basePoints = calcBasePoints(
        pred.predictedHomeScore,
        pred.predictedAwayScore,
        fixture.homeScore!,
        fixture.awayScore!
      )
      return {
        predictionId: pred.id,
        userId: pred.userId,
        groupId: pred.groupId,
        fixtureId: fixture.id,
        basePoints,
        multiplier,
        totalPoints: basePoints * multiplier,
      }
    })

    if (rows.length > 0) {
      await db.insert(predictionScores).values(rows)
      calculated += rows.length
    }
  }

  return NextResponse.json({ calculated })
}
