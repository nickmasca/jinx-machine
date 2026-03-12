export interface Probabilities {
  epl: number
  cl: number
  fa: number
  lc: number
}

/** P(win all 4) = product of all probabilities */
export function quadruple({ epl, cl, fa, lc }: Probabilities): number {
  return epl * cl * fa * lc
}

/** P(win 0 trophies) = product of all failure probabilities */
export function trophyless({ epl, cl, fa, lc }: Probabilities): number {
  return (1 - epl) * (1 - cl) * (1 - fa) * (1 - lc)
}

/** P(win at least 1) = 1 - P(win 0) */
export function atLeastOne(p: Probabilities): number {
  return 1 - trophyless(p)
}

/** P(EPL + CL + FA Cup) — the "classic" treble (no League Cup requirement) */
export function classicTreble({ epl, cl, fa }: Probabilities): number {
  return epl * cl * fa
}

/** P(win EPL and at least one of CL/FA/LC) */
export function eplPlusAtLeastOneOther({ epl, cl, fa, lc }: Probabilities): number {
  return epl * (1 - (1 - cl) * (1 - fa) * (1 - lc))
}

/** P(win at least 2 trophies) = 1 - P(0) - P(exactly 1) */
export function atLeastDouble(p: Probabilities): number {
  return 1 - trophyless(p) - exactlyNTrophies(p, 1)
}

/**
 * P(win exactly n trophies out of 4).
 * Enumerates all C(4, n) combinations using inclusion-exclusion.
 */
export function exactlyNTrophies(p: Probabilities, n: number): number {
  const probs = [p.epl, p.cl, p.fa, p.lc]
  const combos = combinations(probs.length, n)

  return combos.reduce((sum, combo) => {
    let prob = 1
    for (let i = 0; i < probs.length; i++) {
      prob *= combo.includes(i) ? probs[i] : 1 - probs[i]
    }
    return sum + prob
  }, 0)
}

/**
 * Returns [P(0), P(1), P(2), P(3), P(4)] — probability of winning exactly
 * 0, 1, 2, 3 or 4 trophies.
 */
export function trophyDistribution(p: Probabilities): number[] {
  return [0, 1, 2, 3, 4].map((n) => exactlyNTrophies(p, n))
}

/** Returns all combinations of `size` indices chosen from 0..(n-1) */
function combinations(n: number, size: number): number[][] {
  if (size === 0) return [[]]
  if (size > n) return []
  const result: number[][] = []
  function pick(start: number, chosen: number[]) {
    if (chosen.length === size) {
      result.push([...chosen])
      return
    }
    for (let i = start; i < n; i++) {
      pick(i + 1, [...chosen, i])
    }
  }
  pick(0, [])
  return result
}
