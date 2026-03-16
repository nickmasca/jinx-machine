import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { groups, groupMembers, users } from '@/db/schema'
import { eq } from 'drizzle-orm'

// POST /api/groups/join — find group by invite code and join
// Body: { inviteCode: string }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { inviteCode: string }
  const code = body.inviteCode?.trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Invite code required' }, { status: 400 })

  const [group] = await db.select().from(groups).where(eq(groups.inviteCode, code)).limit(1)
  if (!group) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })

  // Ensure user exists in our DB
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (existing.length === 0) {
    const clerkUser = await currentUser()
    if (clerkUser) {
      await db.insert(users).values({
        id: userId,
        username: clerkUser.username ?? clerkUser.firstName ?? userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      })
    }
  }

  await db.insert(groupMembers).values({ groupId: group.id, userId }).onConflictDoNothing()

  return NextResponse.json({ groupId: group.id })
}
