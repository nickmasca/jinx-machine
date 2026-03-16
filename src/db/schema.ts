import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  username: text('username').notNull(),
  email: text('email').notNull(),
  phoneNumber: text('phone_number'), // nullable — for future WhatsApp integration
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  createdBy: text('created_by')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const groupMembers = pgTable(
  'group_members',
  {
    groupId: uuid('group_id')
      .references(() => groups.id)
      .notNull(),
    userId: text('user_id')
      .references(() => users.id)
      .notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })]
)

// Competitions: PL = Premier League, CL = Champions League, FAC = FA Cup, ELC = League Cup
export const fixtures = pgTable('fixtures', {
  id: text('id').primaryKey(), // football-data.org match ID as string
  competition: text('competition').notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  matchDate: timestamp('match_date').notNull(),
  matchday: integer('matchday'),
  season: text('season').notNull(),
  homeScore: integer('home_score'), // null until FINISHED
  awayScore: integer('away_score'),
  status: text('status').notNull().default('SCHEDULED'), // SCHEDULED | IN_PLAY | FINISHED
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
})

export const predictions = pgTable(
  'predictions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .references(() => users.id)
      .notNull(),
    groupId: uuid('group_id')
      .references(() => groups.id)
      .notNull(),
    fixtureId: text('fixture_id')
      .references(() => fixtures.id)
      .notNull(),
    predictedHomeScore: integer('predicted_home_score').notNull(),
    predictedAwayScore: integer('predicted_away_score').notNull(),
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('predictions_user_group_fixture_idx').on(
      table.userId,
      table.groupId,
      table.fixtureId
    ),
  ]
)

// Calculated once per prediction after the fixture finishes
export const predictionScores = pgTable('prediction_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  predictionId: uuid('prediction_id')
    .references(() => predictions.id)
    .notNull(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  groupId: uuid('group_id')
    .references(() => groups.id)
    .notNull(),
  fixtureId: text('fixture_id')
    .references(() => fixtures.id)
    .notNull(),
  basePoints: integer('base_points').notNull().default(0),
  multiplier: integer('multiplier').notNull().default(1), // 2 if Arsenal involved
  totalPoints: integer('total_points').notNull().default(0),
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type Group = typeof groups.$inferSelect
export type Fixture = typeof fixtures.$inferSelect
export type Prediction = typeof predictions.$inferSelect
export type PredictionScore = typeof predictionScores.$inferSelect
