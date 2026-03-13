import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FixtureRow } from './FixtureRow'
import type { Fixture } from '../data/fixtures'

const fixture: Fixture = {
  id: 'test-1',
  opponent: 'Chelsea',
  home: true,
  date: '11 Apr',
}

describe('FixtureRow', () => {
  it('renders the opponent name', () => {
    render(<FixtureRow fixture={fixture} result={null} teamColor="#EF0107" onChange={vi.fn()} />)
    expect(screen.getByText('Chelsea')).toBeInTheDocument()
  })

  it('renders the date', () => {
    render(<FixtureRow fixture={fixture} result={null} teamColor="#EF0107" onChange={vi.fn()} />)
    expect(screen.getByText('11 Apr')).toBeInTheDocument()
  })

  it('renders home indicator for home fixtures', () => {
    render(<FixtureRow fixture={fixture} result={null} teamColor="#EF0107" onChange={vi.fn()} />)
    expect(screen.getByText('H')).toBeInTheDocument()
  })

  it('renders away indicator for away fixtures', () => {
    const awayFixture = { ...fixture, home: false }
    render(<FixtureRow fixture={awayFixture} result={null} teamColor="#EF0107" onChange={vi.fn()} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders W, D, L buttons', () => {
    render(<FixtureRow fixture={fixture} result={null} teamColor="#EF0107" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'W' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'D' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'L' })).toBeInTheDocument()
  })

  it('calls onChange with "W" when W button clicked', () => {
    const onChange = vi.fn()
    render(<FixtureRow fixture={fixture} result={null} teamColor="#EF0107" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'W' }))
    expect(onChange).toHaveBeenCalledWith('W')
  })

  it('calls onChange with "D" when D button clicked', () => {
    const onChange = vi.fn()
    render(<FixtureRow fixture={fixture} result={null} teamColor="#EF0107" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'D' }))
    expect(onChange).toHaveBeenCalledWith('D')
  })

  it('calls onChange with "L" when L button clicked', () => {
    const onChange = vi.fn()
    render(<FixtureRow fixture={fixture} result={null} teamColor="#EF0107" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'L' }))
    expect(onChange).toHaveBeenCalledWith('L')
  })

  it('marks the selected result button as active (aria-pressed)', () => {
    render(<FixtureRow fixture={fixture} result="W" teamColor="#EF0107" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'W' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'D' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'L' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with null when the active button is clicked again (deselect)', () => {
    const onChange = vi.fn()
    render(<FixtureRow fixture={fixture} result="W" teamColor="#EF0107" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'W' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
