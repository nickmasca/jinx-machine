import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { groups, groupMembers, users, predictionScores } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

// GET /api/groups — return groups the current user belongs to
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({ group: groups })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))

  return NextResponse.json(rows.map((r) => r.group))
}

// POST /api/groups — create a new group
// Body: { name: string }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { name: string }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Group name required' }, { status: 400 })
  }

  // Ensure user exists in our DB
  await ensureUser(userId)

  const [group] = await db
    .insert(groups)
    .values({
      name: body.name.trim(),
      inviteCode: generateInviteCode(),
      createdBy: userId,
    })
    .returning()

  // Creator automatically joins
  await db.insert(groupMembers).values({ groupId: group.id, userId })

  return NextResponse.json(group, { status: 201 })
}

async function ensureUser(userId: string) {
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (existing.length > 0) return

  const clerkUser = await currentUser()
  if (!clerkUser) return

  await db.insert(users).values({
    id: userId,
    username: clerkUser.username ?? clerkUser.firstName ?? userId,
    email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
  })
}
