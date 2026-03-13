import { describe, it, expect } from 'vitest'
import {
  resultPoints,
  projectPoints,
  gapToEplProbability,
  titleLeader,
} from './titleRace'

describe('resultPoints', () => {
  it('W gives 3 points', () => {
    expect(resultPoints('W')).toBe(3)
  })
  it('D gives 1 point', () => {
    expect(resultPoints('D')).toBe(1)
  })
  it('L gives 0 points', () => {
    expect(resultPoints('L')).toBe(0)
  })
  it('null gives 0 points', () => {
    expect(resultPoints(null)).toBe(0)
  })
})

describe('projectPoints', () => {
  it('returns current points when no results', () => {
    expect(projectPoints(62, [])).toBe(62)
  })
  it('adds wins correctly', () => {
    expect(projectPoints(60, ['W', 'W', 'W'])).toBe(69)
  })
  it('adds mixed results correctly', () => {
    expect(projectPoints(50, ['W', 'D', 'L'])).toBe(54)
  })
  it('null results add 0', () => {
    expect(projectPoints(50, ['W', null, 'L'])).toBe(53)
  })
})

describe('gapToEplProbability', () => {
  it('returns 50 when tied', () => {
    expect(gapToEplProbability(70, 70)).toBe(50)
  })
  it('returns 95 when Arsenal lead by 8+', () => {
    expect(gapToEplProbability(80, 72)).toBe(95)
    expect(gapToEplProbability(80, 70)).toBe(95)
  })
  it('returns 85 when Arsenal lead by 5-7', () => {
    expect(gapToEplProbability(75, 70)).toBe(85)
    expect(gapToEplProbability(77, 70)).toBe(85)
  })
  it('returns 72 when Arsenal lead by 2-4', () => {
    expect(gapToEplProbability(74, 70)).toBe(72)
    expect(gapToEplProbability(72, 70)).toBe(72)
  })
  it('returns 60 when Arsenal lead by 1', () => {
    expect(gapToEplProbability(71, 70)).toBe(60)
  })
  it('returns 40 when City lead by 1', () => {
    expect(gapToEplProbability(70, 71)).toBe(40)
  })
  it('returns 28 when City lead by 2-4', () => {
    expect(gapToEplProbability(70, 72)).toBe(28)
    expect(gapToEplProbability(70, 74)).toBe(28)
  })
  it('returns 15 when City lead by 5-7', () => {
    expect(gapToEplProbability(70, 75)).toBe(15)
    expect(gapToEplProbability(70, 77)).toBe(15)
  })
  it('returns 5 when City lead by 8+', () => {
    expect(gapToEplProbability(70, 78)).toBe(5)
    expect(gapToEplProbability(60, 90)).toBe(5)
  })
})

describe('titleLeader', () => {
  it('returns "arsenal" when Arsenal have more points', () => {
    expect(titleLeader(75, 70)).toBe('arsenal')
  })
  it('returns "city" when City have more points', () => {
    expect(titleLeader(70, 75)).toBe('city')
  })
  it('returns "tied" when equal points', () => {
    expect(titleLeader(70, 70)).toBe('tied')
  })
})
