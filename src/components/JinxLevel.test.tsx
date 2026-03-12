import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JinxLevel, getJinxLevel } from './JinxLevel'

describe('getJinxLevel', () => {
  it('returns "Measured and realistic" for quadruple probability < 1%', () => {
    const result = getJinxLevel(0.005) // 0.5%
    expect(result.label).toBe('Measured and realistic')
  })

  it('returns "Cautiously optimistic" for quadruple probability between 1-5%', () => {
    const result = getJinxLevel(0.03) // 3%
    expect(result.label).toBe('Cautiously optimistic')
  })

  it('returns "Dangerously optimistic" for quadruple probability between 5-15%', () => {
    const result = getJinxLevel(0.1) // 10%
    expect(result.label).toBe('Dangerously optimistic')
  })

  it('returns "Peak jinx territory" for quadruple probability between 15-30%', () => {
    const result = getJinxLevel(0.2) // 20%
    expect(result.label).toBe('Peak jinx territory')
  })

  it('returns "You\'ve cursed us all" for quadruple probability >= 30%', () => {
    const result = getJinxLevel(0.5) // 50%
    expect(result.label).toBe("You've cursed us all")
  })

  it('returns an emoji for each level', () => {
    expect(getJinxLevel(0.005).emoji).toBeTruthy()
    expect(getJinxLevel(0.03).emoji).toBeTruthy()
    expect(getJinxLevel(0.1).emoji).toBeTruthy()
    expect(getJinxLevel(0.2).emoji).toBeTruthy()
    expect(getJinxLevel(0.5).emoji).toBeTruthy()
  })

  it('handles exactly 0%', () => {
    const result = getJinxLevel(0)
    expect(result.label).toBe('Measured and realistic')
  })

  it('handles exactly 100%', () => {
    const result = getJinxLevel(1)
    expect(result.label).toBe("You've cursed us all")
  })
})

describe('JinxLevel component', () => {
  it('renders the jinx level section', () => {
    render(<JinxLevel quadrupleProb={0.063} />)
    expect(screen.getByText(/jinx level/i)).toBeInTheDocument()
  })

  it('renders the correct label for a given probability', () => {
    render(<JinxLevel quadrupleProb={0.063} />)
    expect(screen.getByText('Dangerously optimistic')).toBeInTheDocument()
  })

  it('renders the quadruple probability', () => {
    render(<JinxLevel quadrupleProb={0.063} />)
    expect(screen.getByText(/6\.3%/)).toBeInTheDocument()
  })
})
