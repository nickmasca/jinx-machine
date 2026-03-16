import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { groups, groupMembers } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { LeaderboardEntry } from '@/types/leaderboard'

async function getLeaderboard(groupId: string): Promise<LeaderboardEntry[]> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/leaderboard/${groupId}`, {
    headers: { Cookie: '' }, // server-to-server — auth handled via shared session
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  return res.json() as Promise<LeaderboardEntry[]>
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { groupId } = await params

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1)
  if (!group) notFound()

  // Check membership
  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1)

  if (!membership) redirect('/league')

  const leaderboard = await getLeaderboard(groupId)

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#EF0107]/10 to-transparent pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 pb-16 pt-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/league"
              className="text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              ← Jinx League
            </Link>
            <h1 className="text-3xl font-black text-white mt-2">{group.name}</h1>
            <p className="text-white/40 text-xs mt-1">
              Code: <span className="font-mono text-white/60">{group.inviteCode}</span>
            </p>
          </div>
          <Link
            href={`/league/${groupId}/predict`}
            className="bg-[#EF0107] hover:bg-[#EF0107]/80 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            Submit predictions →
          </Link>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <h2 className="text-white font-semibold text-sm uppercase tracking-widest">
              Leaderboard
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="px-5 py-10 text-center text-white/40 text-sm">
              No scores yet — be the first to predict!
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    entry.userId === userId ? 'bg-[#EF0107]/5' : ''
                  }`}
                >
                  <span
                    className={`text-xl font-black w-8 text-center ${
                      i === 0
                        ? 'text-yellow-400'
                        : i === 1
                          ? 'text-white/60'
                          : i === 2
                            ? 'text-amber-600'
                            : 'text-white/30'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {entry.username}
                      {entry.userId === userId && (
                        <span className="text-white/30 text-xs ml-2">(you)</span>
                      )}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {entry.correctScores} correct scores · {entry.correctOutcomes} correct
                      outcomes · {entry.predictions} predictions
                    </p>
                  </div>
                  <span className="text-[#EF0107] font-black text-xl">
                    {entry.totalPoints}
                    <span className="text-white/30 text-xs font-normal ml-1">pts</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
