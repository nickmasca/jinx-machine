import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SliderPanel } from './SliderPanel'

describe('SliderPanel', () => {
  const defaultProps = {
    values: { epl: 70, cl: 30, fa: 60, lc: 50 },
    onChange: vi.fn(),
  }

  it('renders all four trophy sliders', () => {
    render(<SliderPanel {...defaultProps} />)
    expect(screen.getByText('Premier League')).toBeInTheDocument()
    expect(screen.getByText('Champions League')).toBeInTheDocument()
    expect(screen.getByText('FA Cup')).toBeInTheDocument()
    expect(screen.getByText('League Cup')).toBeInTheDocument()
  })

  it('renders the section question heading', () => {
    render(<SliderPanel {...defaultProps} />)
    expect(screen.getByText(/how many trophies will arsenal win/i)).toBeInTheDocument()
  })

  it('displays correct percentages for each trophy', () => {
    render(<SliderPanel {...defaultProps} />)
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('30%')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders four range inputs', () => {
    render(<SliderPanel {...defaultProps} />)
    expect(screen.getAllByRole('slider')).toHaveLength(4)
  })
})
