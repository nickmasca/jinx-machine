import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { groupMembers, predictionScores, users } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export interface LeaderboardEntry {
  userId: string
  username: string
  totalPoints: number
  correctScores: number
  correctOutcomes: number
  predictions: number
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { groupId } = await params

  // Verify requester is a member of the group
  const membership = await db
    .select()
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId))
    .limit(1)

  if (membership.length === 0) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Aggregate scores per user
  const rows = await db
    .select({
      userId: predictionScores.userId,
      totalPoints: sql<number>`sum(${predictionScores.totalPoints})`,
      correctScores: sql<number>`count(*) filter (where ${predictionScores.basePoints} = 10)`,
      correctOutcomes: sql<number>`count(*) filter (where ${predictionScores.basePoints} > 0)`,
      predictions: sql<number>`count(*)`,
    })
    .from(predictionScores)
    .where(eq(predictionScores.groupId, groupId))
    .groupBy(predictionScores.userId)

  // Join with user names
  const userIds = rows.map((r) => r.userId)
  const userRows =
    userIds.length > 0
      ? await db.select().from(users).where(sql`${users.id} = ANY(${userIds})`)
      : []

  const userMap = Object.fromEntries(userRows.map((u) => [u.id, u.username]))

  const leaderboard: LeaderboardEntry[] = rows
    .map((r) => ({
      userId: r.userId,
      username: userMap[r.userId] ?? r.userId,
      totalPoints: Number(r.totalPoints),
      correctScores: Number(r.correctScores),
      correctOutcomes: Number(r.correctOutcomes),
      predictions: Number(r.predictions),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  return NextResponse.json(leaderboard)
}
