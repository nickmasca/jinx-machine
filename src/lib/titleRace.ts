export type MatchResult = 'W' | 'D' | 'L' | null

export type TitleLeader = 'arsenal' | 'city' | 'tied'

/** Points awarded for a match result */
export function resultPoints(result: MatchResult): number {
  if (result === 'W') return 3
  if (result === 'D') return 1
  return 0
}

/** Project final points from a starting total and a list of predicted results */
export function projectPoints(
  currentPoints: number,
  results: MatchResult[]
): number {
  return results.reduce((total, r) => total + resultPoints(r), currentPoints)
}

/**
 * Convert Arsenal-vs-City projected points gap into an EPL win probability (0–100).
 * Gap = arsenalPts - cityPts. Positive means Arsenal ahead.
 */
export function gapToEplProbability(arsenalPts: number, cityPts: number): number {
  const gap = arsenalPts - cityPts
  if (gap >= 8) return 95
  if (gap >= 5) return 85
  if (gap >= 2) return 72
  if (gap === 1) return 60
  if (gap === 0) return 50
  if (gap === -1) return 40
  if (gap >= -4) return 28
  if (gap >= -7) return 15
  return 5
}

/** Which team is currently projected to win the title */
export function titleLeader(arsenalPts: number, cityPts: number): TitleLeader {
  if (arsenalPts > cityPts) return 'arsenal'
  if (cityPts > arsenalPts) return 'city'
  return 'tied'
}
