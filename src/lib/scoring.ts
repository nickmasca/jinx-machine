const ARSENAL_NAMES = ['Arsenal FC', 'Arsenal']

/**
 * Derives W/D/L outcome from a scoreline.
 * Returns 'H' (home win), 'D' (draw), or 'A' (away win).
 */
export function outcome(homeScore: number, awayScore: number): 'H' | 'D' | 'A' {
  if (homeScore > awayScore) return 'H'
  if (homeScore < awayScore) return 'A'
  return 'D'
}

/**
 * Calculates base points for a prediction.
 *
 * Scoring rules:
 *   - Correct scoreline: 10 pts
 *   - Correct outcome (win): 1 pt
 *   - Correct outcome (draw): 2 pts
 *   - Wrong: 0 pts
 */
export function calcBasePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predictedHome === actualHome && predictedAway === actualAway) return 10
  const predictedOutcome = outcome(predictedHome, predictedAway)
  const actualOutcome = outcome(actualHome, actualAway)
  if (predictedOutcome !== actualOutcome) return 0
  return actualOutcome === 'D' ? 2 : 1
}

/**
 * Returns 2 if Arsenal are involved in the fixture (home or away), else 1.
 */
export function arsenalMultiplier(homeTeam: string, awayTeam: string): 1 | 2 {
  const isArsenal = (name: string) => ARSENAL_NAMES.some((n) => name.includes(n))
  return isArsenal(homeTeam) || isArsenal(awayTeam) ? 2 : 1
}
