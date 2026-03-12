import { describe, it, expect } from 'vitest'
import {
  quadruple,
  trophyless,
  atLeastOne,
  classicTreble,
  eplPlusAtLeastOneOther,
  atLeastDouble,
  exactlyNTrophies,
  trophyDistribution,
} from './probability'

// Helper: all probabilities as decimals (0-1)
const allHigh = { epl: 0.7, cl: 0.3, fa: 0.6, lc: 0.5 }
const allZero = { epl: 0, cl: 0, fa: 0, lc: 0 }
const allHundred = { epl: 1, cl: 1, fa: 1, lc: 1 }
const onlyEpl = { epl: 1, cl: 0, fa: 0, lc: 0 }
const eplAndCl = { epl: 0.8, cl: 0.6, fa: 0, lc: 0 }

describe('quadruple', () => {
  it('calculates the product of all four probabilities', () => {
    expect(quadruple(allHigh)).toBeCloseTo(0.7 * 0.3 * 0.6 * 0.5)
  })

  it('returns 0 when all probabilities are 0', () => {
    expect(quadruple(allZero)).toBe(0)
  })

  it('returns 1 when all probabilities are 1', () => {
    expect(quadruple(allHundred)).toBe(1)
  })

  it('returns 0 when any probability is 0', () => {
    expect(quadruple(onlyEpl)).toBe(0)
  })
})

describe('trophyless', () => {
  it('calculates the probability of winning zero trophies', () => {
    expect(trophyless(allHigh)).toBeCloseTo(0.3 * 0.7 * 0.4 * 0.5)
  })

  it('returns 1 when all probabilities are 0', () => {
    expect(trophyless(allZero)).toBe(1)
  })

  it('returns 0 when all probabilities are 1', () => {
    expect(trophyless(allHundred)).toBe(0)
  })
})

describe('atLeastOne', () => {
  it('equals 1 minus trophyless', () => {
    expect(atLeastOne(allHigh)).toBeCloseTo(1 - 0.3 * 0.7 * 0.4 * 0.5)
  })

  it('returns 0 when all probabilities are 0', () => {
    expect(atLeastOne(allZero)).toBe(0)
  })

  it('returns 1 when all probabilities are 1', () => {
    expect(atLeastOne(allHundred)).toBe(1)
  })

  it('returns 1 when any single trophy is certain', () => {
    expect(atLeastOne(onlyEpl)).toBe(1)
  })
})

describe('classicTreble', () => {
  it('calculates EPL x CL x FA Cup', () => {
    expect(classicTreble(allHigh)).toBeCloseTo(0.7 * 0.3 * 0.6)
  })

  it('returns 0 when EPL is 0', () => {
    expect(classicTreble({ epl: 0, cl: 0.5, fa: 0.5, lc: 0.5 })).toBe(0)
  })

  it('is independent of league cup probability', () => {
    const withLc = classicTreble({ epl: 0.5, cl: 0.5, fa: 0.5, lc: 1 })
    const withoutLc = classicTreble({ epl: 0.5, cl: 0.5, fa: 0.5, lc: 0 })
    expect(withLc).toBe(withoutLc)
  })
})

describe('eplPlusAtLeastOneOther', () => {
  it('calculates EPL * (1 - P(no other trophies))', () => {
    const expected = 0.7 * (1 - 0.7 * 0.4 * 0.5)
    expect(eplPlusAtLeastOneOther(allHigh)).toBeCloseTo(expected)
  })

  it('returns 0 when EPL is 0', () => {
    expect(eplPlusAtLeastOneOther({ epl: 0, cl: 1, fa: 1, lc: 1 })).toBe(0)
  })

  it('returns 0 when EPL is certain but no other trophies possible', () => {
    expect(eplPlusAtLeastOneOther({ epl: 1, cl: 0, fa: 0, lc: 0 })).toBe(0)
  })

  it('returns EPL probability when all others are certain', () => {
    expect(eplPlusAtLeastOneOther({ epl: 0.7, cl: 1, fa: 1, lc: 1 })).toBeCloseTo(0.7)
  })
})

describe('atLeastDouble', () => {
  it('equals 1 - P(0) - P(exactly 1)', () => {
    const p0 = trophyless(allHigh)
    const p1 = exactlyNTrophies(allHigh, 1)
    expect(atLeastDouble(allHigh)).toBeCloseTo(1 - p0 - p1)
  })

  it('returns 0 when all probabilities are 0', () => {
    expect(atLeastDouble(allZero)).toBe(0)
  })

  it('returns 1 when all probabilities are 1', () => {
    expect(atLeastDouble(allHundred)).toBe(1)
  })

  it('returns 0 when only one trophy is possible', () => {
    expect(atLeastDouble(onlyEpl)).toBe(0)
  })

  it('equals P(EPL)*P(CL) when only two trophies are possible', () => {
    expect(atLeastDouble(eplAndCl)).toBeCloseTo(0.8 * 0.6)
  })
})

describe('exactlyNTrophies', () => {
  it('calculates P(exactly 0) = trophyless', () => {
    expect(exactlyNTrophies(allHigh, 0)).toBeCloseTo(trophyless(allHigh))
  })

  it('calculates P(exactly 4) = quadruple', () => {
    expect(exactlyNTrophies(allHigh, 4)).toBeCloseTo(quadruple(allHigh))
  })

  it('calculates P(exactly 1) correctly', () => {
    const { epl, cl, fa, lc } = allHigh
    // Sum of: each trophy won, all others lost
    const expected =
      epl * (1 - cl) * (1 - fa) * (1 - lc) +
      (1 - epl) * cl * (1 - fa) * (1 - lc) +
      (1 - epl) * (1 - cl) * fa * (1 - lc) +
      (1 - epl) * (1 - cl) * (1 - fa) * lc
    expect(exactlyNTrophies(allHigh, 1)).toBeCloseTo(expected)
  })

  it('returns 1 for exactly 0 when all probabilities are 0', () => {
    expect(exactlyNTrophies(allZero, 0)).toBe(1)
  })

  it('returns 0 for exactly 1 when all probabilities are 0', () => {
    expect(exactlyNTrophies(allZero, 1)).toBe(0)
  })

  it('returns 1 for exactly 4 when all probabilities are 1', () => {
    expect(exactlyNTrophies(allHundred, 4)).toBe(1)
  })

  it('returns 0 for exactly 3 when all probabilities are 1', () => {
    expect(exactlyNTrophies(allHundred, 3)).toBe(0)
  })
})

describe('trophyDistribution', () => {
  it('returns probabilities for 0 through 4 trophies', () => {
    const dist = trophyDistribution(allHigh)
    expect(dist).toHaveLength(5)
  })

  it('sums to 1', () => {
    const dist = trophyDistribution(allHigh)
    const sum = dist.reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1)
  })

  it('sums to 1 for edge case all zeros', () => {
    const dist = trophyDistribution(allZero)
    expect(dist[0]).toBe(1)
    expect(dist[1]).toBe(0)
    expect(dist[2]).toBe(0)
    expect(dist[3]).toBe(0)
    expect(dist[4]).toBe(0)
  })

  it('sums to 1 for edge case all ones', () => {
    const dist = trophyDistribution(allHundred)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(0)
    expect(dist[2]).toBe(0)
    expect(dist[3]).toBe(0)
    expect(dist[4]).toBe(1)
  })
})
