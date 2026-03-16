import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { fixtures, predictions, groups, groupMembers } from '@/db/schema'
import { and, eq, gte, notInArray } from 'drizzle-orm'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PredictionForm } from './PredictionForm'
import type { Fixture, Prediction } from '@/db/schema'

export default async function PredictPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { groupId } = await params

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1)
  if (!group) notFound()

  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1)

  if (!membership) redirect('/league')

  const now = new Date()

  // Upcoming fixtures for next 14 days
  const upcomingFixtures: Fixture[] = await db
    .select()
    .from(fixtures)
    .where(and(gte(fixtures.matchDate, now), notInArray(fixtures.status, ['FINISHED', 'CANCELLED', 'POSTPONED']), notInArray(fixtures.competition, ['ELC'])))
    .orderBy(fixtures.matchDate)

  // User's existing predictions for this group
  const existingPredictions: Prediction[] = await db
    .select()
    .from(predictions)
    .where(and(eq(predictions.userId, userId), eq(predictions.groupId, groupId)))

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#EF0107]/10 to-transparent pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 pb-16 pt-10">
        <div className="mb-8">
          <Link
            href={`/league/${groupId}`}
            className="text-white/40 text-sm hover:text-white/60 transition-colors"
          >
            ← {group.name}
          </Link>
          <h1 className="text-3xl font-black text-white mt-2">Submit Predictions</h1>
          <p className="text-white/50 text-sm mt-1">Predictions lock at kickoff.</p>
        </div>

        {upcomingFixtures.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <p className="text-lg mb-2">No upcoming fixtures</p>
            <p className="text-sm">Check back closer to the next round of matches.</p>
          </div>
        ) : (
          <PredictionForm
            fixtures={upcomingFixtures}
            existingPredictions={existingPredictions}
            groupId={groupId}
          />
        )}
      </div>
    </div>
  )
}
