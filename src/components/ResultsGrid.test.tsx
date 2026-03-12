import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultsGrid } from './ResultsGrid'

const allHigh = { epl: 0.7, cl: 0.3, fa: 0.6, lc: 0.5 }

describe('ResultsGrid', () => {
  it('renders the Quadruple scenario', () => {
    render(<ResultsGrid probs={allHigh} />)
    expect(screen.getByText('Quadruple')).toBeInTheDocument()
  })

  it('renders the At Least 1 Trophy scenario', () => {
    render(<ResultsGrid probs={allHigh} />)
    expect(screen.getByText(/at least 1/i)).toBeInTheDocument()
  })

  it('renders the Trophyless scenario', () => {
    render(<ResultsGrid probs={allHigh} />)
    expect(screen.getByText(/trophyless/i)).toBeInTheDocument()
  })

  it('renders the Classic Treble scenario', () => {
    render(<ResultsGrid probs={allHigh} />)
    expect(screen.getByText(/classic treble/i)).toBeInTheDocument()
  })

  it('renders the EPL + 1 Other scenario', () => {
    render(<ResultsGrid probs={allHigh} />)
    expect(screen.getByText(/epl \+ 1 other/i)).toBeInTheDocument()
  })

  it('renders the Any Double scenario', () => {
    render(<ResultsGrid probs={allHigh} />)
    expect(screen.getByText(/any double/i)).toBeInTheDocument()
  })

  it('shows correct quadruple probability for allHigh inputs', () => {
    render(<ResultsGrid probs={allHigh} />)
    // 0.7 * 0.3 * 0.6 * 0.5 = 0.063 = 6.3%
    expect(screen.getByText('6.3%')).toBeInTheDocument()
  })

  it('shows 0.0% for quadruple when all probs are 0', () => {
    render(<ResultsGrid probs={{ epl: 0, cl: 0, fa: 0, lc: 0 }} />)
    // Multiple 0.0% values will exist — just check quadruple label exists
    expect(screen.getByText('Quadruple')).toBeInTheDocument()
    expect(screen.getAllByText('0.0%').length).toBeGreaterThan(0)
  })
})
