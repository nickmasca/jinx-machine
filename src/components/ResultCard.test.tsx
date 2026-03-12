import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultCard } from './ResultCard'

describe('ResultCard', () => {
  it('renders the scenario label', () => {
    render(<ResultCard label="Quadruple" value={0.063} />)
    expect(screen.getByText('Quadruple')).toBeInTheDocument()
  })

  it('renders the probability as a percentage with 1 decimal place', () => {
    render(<ResultCard label="Quadruple" value={0.063} />)
    expect(screen.getByText('6.3%')).toBeInTheDocument()
  })

  it('renders 0.0% for zero probability', () => {
    render(<ResultCard label="Trophyless" value={0} />)
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })

  it('renders 100.0% for certain probability', () => {
    render(<ResultCard label="At Least 1" value={1} />)
    expect(screen.getByText('100.0%')).toBeInTheDocument()
  })

  it('renders an optional description when provided', () => {
    render(<ResultCard label="Classic Treble" value={0.5} description="EPL + CL + FA Cup" />)
    expect(screen.getByText('EPL + CL + FA Cup')).toBeInTheDocument()
  })
})
