import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { fixtures, predictions, groups, groupMembers } from '@/db/schema'
import { and, eq, gte, lte, notInArray } from 'drizzle-orm'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PredictionForm } from './PredictionForm'
import type { Fixture, Prediction } from '@/db/schema'

// Returns the end of the window containing `date`, then the end of the following window.
// Weekend window: Friday 00:00 UTC → Monday 23:59 UTC
// Midweek window: Tuesday 00:00 UTC → Thursday 23:59 UTC
function getTwoWindowEnd(date: Date): Date {
  const day = date.getUTCDay() // 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  const base = new Date(date)
  base.setUTCHours(0, 0, 0, 0)

  if ([5, 6, 0, 1].includes(day)) {
    // Currently in weekend window (Fri–Mon) → extend through next midweek (Thu)
    const daysFromFriday = (day - 5 + 7) % 7
    const friday = new Date(base)
    friday.setUTCDate(base.getUTCDate() - daysFromFriday)
    // Thu = Fri + 6
    const thursday = new Date(friday)
    thursday.setUTCDate(friday.getUTCDate() + 6)
    thursday.setUTCHours(23, 59, 59, 999)
    return thursday
  } else {
    // Currently in midweek window (Tue–Thu) → extend through next weekend (Mon)
    const daysFromTuesday = (day - 2 + 7) % 7
    const tuesday = new Date(base)
    tuesday.setUTCDate(base.getUTCDate() - daysFromTuesday)
    // Mon = Tue + 6
    const monday = new Date(tuesday)
    monday.setUTCDate(tuesday.getUTCDate() + 6)
    monday.setUTCHours(23, 59, 59, 999)
    return monday
  }
}

const EXCLUDED_STATUSES = ['FINISHED', 'CANCELLED', 'POSTPONED'] as const
const EXCLUDED_COMPETITIONS = ['ELC'] as const

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

  // Find the next upcoming fixture to anchor the window calculation
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

  // Show: remaining fixtures in the current window + the full next window
  let upcomingFixtures: Fixture[] = []
  if (next) {
    const end = getTwoWindowEnd(next.matchDate)
    upcomingFixtures = await db
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
  }

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
