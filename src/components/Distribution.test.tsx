import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Distribution } from './Distribution'
import { prepareDistributionData } from './Distribution'

const allHigh = { epl: 0.7, cl: 0.3, fa: 0.6, lc: 0.5 }
const allZero = { epl: 0, cl: 0, fa: 0, lc: 0 }
const allHundred = { epl: 1, cl: 1, fa: 1, lc: 1 }

describe('prepareDistributionData', () => {
  it('returns 5 entries for 0 through 4 trophies', () => {
    const data = prepareDistributionData(allHigh)
    expect(data).toHaveLength(5)
  })

  it('labels entries correctly', () => {
    const data = prepareDistributionData(allHigh)
    expect(data[0].label).toBe('0')
    expect(data[1].label).toBe('1')
    expect(data[4].label).toBe('4')
  })

  it('probabilities sum to 100%', () => {
    const data = prepareDistributionData(allHigh)
    const sum = data.reduce((acc, d) => acc + d.value, 0)
    expect(sum).toBeCloseTo(100)
  })

  it('returns 100% for 0 trophies when all probs are 0', () => {
    const data = prepareDistributionData(allZero)
    expect(data[0].value).toBeCloseTo(100)
    expect(data[1].value).toBeCloseTo(0)
  })

  it('returns 100% for 4 trophies when all probs are 1', () => {
    const data = prepareDistributionData(allHundred)
    expect(data[4].value).toBeCloseTo(100)
    expect(data[3].value).toBeCloseTo(0)
  })
})

describe('Distribution component', () => {
  it('renders the section heading', () => {
    render(<Distribution probs={allHigh} />)
    expect(screen.getByText(/trophy distribution/i)).toBeInTheDocument()
  })

  it('renders the subtitle description', () => {
    render(<Distribution probs={allHigh} />)
    expect(screen.getByText(/probability of winning exactly/i)).toBeInTheDocument()
  })
})
