import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ShareButton } from './ShareButton'

describe('ShareButton', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    // jsdom doesn't implement location.href assignment cleanly, set it
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/', search: '' },
      writable: true,
    })
  })

  it('renders a share button', () => {
    render(<ShareButton values={{ epl: 70, cl: 30, fa: 60, lc: 50 }} />)
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
  })

  it('calls clipboard.writeText when clicked', async () => {
    render(<ShareButton values={{ epl: 70, cl: 30, fa: 60, lc: 50 }} />)
    const button = screen.getByRole('button', { name: /copy link/i })
    await act(async () => {
      fireEvent.click(button)
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('shows "Copied!" feedback after clicking', async () => {
    render(<ShareButton values={{ epl: 70, cl: 30, fa: 60, lc: 50 }} />)
    const button = screen.getByRole('button', { name: /copy link/i })
    await act(async () => {
      fireEvent.click(button)
    })
    expect(screen.getByText(/copied/i)).toBeInTheDocument()
  })

  it('includes encoded values in the copied URL', async () => {
    render(<ShareButton values={{ epl: 70, cl: 30, fa: 60, lc: 50 }} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy link/i }))
    })
    const url = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(url).toContain('epl=70')
    expect(url).toContain('cl=30')
  })
})
