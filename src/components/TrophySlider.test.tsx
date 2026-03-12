import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TrophySlider } from './TrophySlider'

describe('TrophySlider', () => {
  const defaultProps = {
    label: 'Premier League',
    emoji: '🏆',
    value: 70,
    onChange: vi.fn(),
  }

  it('renders the trophy label', () => {
    render(<TrophySlider {...defaultProps} />)
    expect(screen.getByText('Premier League')).toBeInTheDocument()
  })

  it('renders the emoji', () => {
    render(<TrophySlider {...defaultProps} />)
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('displays the current percentage value', () => {
    render(<TrophySlider {...defaultProps} />)
    expect(screen.getByText('70%')).toBeInTheDocument()
  })

  it('renders a range input with correct value', () => {
    render(<TrophySlider {...defaultProps} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('70')
  })

  it('calls onChange with new numeric value when slider changes', () => {
    const onChange = vi.fn()
    render(<TrophySlider {...defaultProps} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '80' } })
    expect(onChange).toHaveBeenCalledWith(80)
  })

  it('clamps value display at 0%', () => {
    render(<TrophySlider {...defaultProps} value={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('clamps value display at 100%', () => {
    render(<TrophySlider {...defaultProps} value={100} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})
