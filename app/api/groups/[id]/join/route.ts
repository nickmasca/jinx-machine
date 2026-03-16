import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { groups, groupMembers, users } from '@/db/schema'
import { eq } from 'drizzle-orm'

// POST /api/groups/[id]/join — join group by invite code
// Body: { inviteCode: string }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = (await req.json()) as { inviteCode: string }

  const [group] = await db.select().from(groups).where(eq(groups.id, id)).limit(1)
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  if (group.inviteCode !== body.inviteCode?.toUpperCase()) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 })
  }

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

  // Add to group (ignore if already a member)
  await db
    .insert(groupMembers)
    .values({ groupId: id, userId })
    .onConflictDoNothing()

  return NextResponse.json({ joined: group.id })
}
