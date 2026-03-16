import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { groupMembers, groups } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { GroupActions } from './GroupActions'

export default async function LeaguePage() {
  const { userId } = await auth()
  if (!userId) return null // middleware handles redirect

  const userGroups = await db
    .select({ group: groups })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#EF0107]/10 to-transparent pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 pb-16 pt-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-white/40 text-sm hover:text-white/60 transition-colors">
              ← The Jinx Machine
            </Link>
            <h1 className="text-3xl font-black text-white mt-2">Jinx League</h1>
            <p className="text-white/50 text-sm mt-1">
              Predict scores. Prove you&apos;re not a jinx.
            </p>
          </div>
          <div className="bg-[#EF0107] text-white text-xs font-bold px-3 py-1 rounded-full">
            Arsenal FC
          </div>
        </div>

        {/* Groups list */}
        {userGroups.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <p className="text-lg mb-2">No groups yet</p>
            <p className="text-sm">Create a group or join one with an invite code below.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {userGroups.map(({ group }) => (
              <Link
                key={group.id}
                href={`/league/${group.id}`}
                className="block bg-white/5 hover:bg-white/8 border border-white/10 hover:border-[#EF0107]/40 rounded-xl p-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{group.name}</span>
                  <span className="text-white/30 text-sm">→</span>
                </div>
                <p className="text-white/40 text-xs mt-1">
                  Invite code: <span className="font-mono text-white/60">{group.inviteCode}</span>
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Create / join group actions */}
        <GroupActions />

        {/* Scoring guide */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white/80 font-semibold mb-3 text-sm uppercase tracking-widest">
            Scoring
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Correct scoreline</span>
              <span className="text-[#EF0107] font-bold">10 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Correct outcome (win)</span>
              <span className="text-white font-semibold">1 pt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Correct outcome (draw)</span>
              <span className="text-white font-semibold">2 pts</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
              <span className="text-white/60">Arsenal involved</span>
              <span className="text-yellow-400 font-bold">×2 multiplier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
