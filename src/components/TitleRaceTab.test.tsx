import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TitleRaceTab } from './TitleRaceTab'
import type { FixtureResults } from './TitleRaceTab'

// Minimal fixture set for testing (override the imported data)
vi.mock('../data/fixtures', () => ({
  ARSENAL_CURRENT_POINTS: 10,
  CITY_CURRENT_POINTS: 7,
  ARSENAL_REMAINING: [
    { id: 'a1', opponent: 'Everton', home: true, date: '14 Mar' },
    { id: 'a2', opponent: 'Wolves',  home: false, date: '21 Mar' },
  ],
  CITY_REMAINING: [
    { id: 'c1', opponent: 'West Ham',       home: false, date: '14 Mar' },
    { id: 'c2', opponent: 'Crystal Palace', home: true,  date: '21 Mar' },
  ],
}))

function makeResults(
  arsenalEntries: [string, 'W' | 'D' | 'L' | null][],
  cityEntries: [string, 'W' | 'D' | 'L' | null][]
): FixtureResults {
  return {
    arsenal: Object.fromEntries(arsenalEntries),
    city: Object.fromEntries(cityEntries),
  }
}

const emptyResults: FixtureResults = {
  arsenal: { a1: null, a2: null },
  city: { c1: null, c2: null },
}

describe('TitleRaceTab', () => {
  it('shows Arsenal section heading', () => {
    render(<TitleRaceTab results={emptyResults} onResultChange={vi.fn()} onEplChange={vi.fn()} />)
    expect(screen.getByText('Arsenal')).toBeInTheDocument()
  })

  it('shows Man City section heading', () => {
    render(<TitleRaceTab results={emptyResults} onResultChange={vi.fn()} onEplChange={vi.fn()} />)
    expect(screen.getByText('Man City')).toBeInTheDocument()
  })

  it('shows current Arsenal points', () => {
    render(<TitleRaceTab results={emptyResults} onResultChange={vi.fn()} onEplChange={vi.fn()} />)
    // With no results, projected = current = 10
    expect(screen.getByTestId('arsenal-points')).toHaveTextContent('10')
  })

  it('shows current City points', () => {
    render(<TitleRaceTab results={emptyResults} onResultChange={vi.fn()} onEplChange={vi.fn()} />)
    expect(screen.getByTestId('city-points')).toHaveTextContent('7')
  })

  it('projects Arsenal points correctly when wins entered', () => {
    const results = makeResults([['a1', 'W'], ['a2', 'W']], [['c1', null], ['c2', null]])
    render(<TitleRaceTab results={results} onResultChange={vi.fn()} onEplChange={vi.fn()} />)
    // 10 + 3 + 3 = 16
    expect(screen.getByTestId('arsenal-points')).toHaveTextContent('16')
  })

  it('projects City points correctly when wins entered', () => {
    const results = makeResults([['a1', null], ['a2', null]], [['c1', 'W'], ['c2', 'D']])
    render(<TitleRaceTab results={results} onResultChange={vi.fn()} onEplChange={vi.fn()} />)
    // 7 + 3 + 1 = 11
    expect(screen.getByTestId('city-points')).toHaveTextContent('11')
  })

  it('calls onEplChange when a fixture result is picked', () => {
    const onEplChange = vi.fn()
    render(<TitleRaceTab results={emptyResults} onResultChange={vi.fn()} onEplChange={onEplChange} />)
    // Clicking a W button should trigger onEplChange
    const wButtons = screen.getAllByRole('button', { name: 'W' })
    fireEvent.click(wButtons[0])
    expect(onEplChange).toHaveBeenCalled()
  })

  it('calls onResultChange with correct team and fixtureId when result picked', () => {
    const onResultChange = vi.fn()
    render(<TitleRaceTab results={emptyResults} onResultChange={onResultChange} onEplChange={vi.fn()} />)
    const wButtons = screen.getAllByRole('button', { name: 'W' })
    fireEvent.click(wButtons[0])
    // First W button belongs to first Arsenal fixture
    expect(onResultChange).toHaveBeenCalledWith('arsenal', 'a1', 'W')
  })

  it('shows "Arsenal lead" outcome when Arsenal projected ahead', () => {
    // Arsenal: 10 + 3 = 13, City: 7 (no results) → Arsenal ahead
    const results = makeResults([['a1', 'W'], ['a2', null]], [['c1', null], ['c2', null]])
    render(<TitleRaceTab results={results} onResultChange={vi.fn()} onEplChange={vi.fn()} />)
    expect(screen.getByTestId('title-outcome')).toHaveTextContent(/arsenal/i)
  })

  it('shows "City lead" outcome when City projected ahead', () => {
    // Arsenal: 10, City: 7 + 3 + 3 = 13 → City ahead
    const results = makeResults([['a1', null], ['a2', null]], [['c1', 'W'], ['c2', 'W']])
    render(<TitleRaceTab results={results} onResultChange={vi.fn()} onEplChange={vi.fn()} />)
    expect(screen.getByTestId('title-outcome')).toHaveTextContent(/city/i)
  })
})
