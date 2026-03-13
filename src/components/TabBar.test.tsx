import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TabBar } from './TabBar'

describe('TabBar', () => {
  it('renders both tab labels', () => {
    render(<TabBar activeTab="trophy" onChange={vi.fn()} />)
    expect(screen.getByText('Trophy Machine')).toBeInTheDocument()
    expect(screen.getByText('Title Race')).toBeInTheDocument()
  })

  it('marks the active tab with aria-selected="true"', () => {
    render(<TabBar activeTab="trophy" onChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Trophy Machine' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Title Race' })).toHaveAttribute('aria-selected', 'false')
  })

  it('marks the title race tab active when activeTab is "race"', () => {
    render(<TabBar activeTab="race" onChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Title Race' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Trophy Machine' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onChange with "race" when Title Race tab is clicked', () => {
    const onChange = vi.fn()
    render(<TabBar activeTab="trophy" onChange={onChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Title Race' }))
    expect(onChange).toHaveBeenCalledWith('race')
  })

  it('calls onChange with "trophy" when Trophy Machine tab is clicked', () => {
    const onChange = vi.fn()
    render(<TabBar activeTab="race" onChange={onChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Trophy Machine' }))
    expect(onChange).toHaveBeenCalledWith('trophy')
  })
})
