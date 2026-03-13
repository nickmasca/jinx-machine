import type { Fixture } from '../data/fixtures'
import type { MatchResult } from '../lib/titleRace'

interface FixtureRowProps {
  fixture: Fixture
  result: MatchResult
  teamColor: string
  onChange: (result: MatchResult) => void
}

const BUTTONS: { label: 'W' | 'D' | 'L'; value: MatchResult }[] = [
  { label: 'W', value: 'W' },
  { label: 'D', value: 'D' },
  { label: 'L', value: 'L' },
]

export function FixtureRow({ fixture, result, teamColor, onChange }: FixtureRowProps) {
  function handleClick(value: MatchResult) {
    // Clicking the already-selected button deselects it
    onChange(result === value ? null : value)
  }

  return (
    <div className="py-1.5">
      {/* Line 1: date + W/D/L buttons */}
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs">{fixture.date}</span>
        <div className="flex gap-1">
          {BUTTONS.map(({ label, value }) => {
            const isActive = result === value
            return (
              <button
                key={label}
                aria-pressed={isActive}
                onClick={() => handleClick(value)}
                className={`
                  w-8 h-7 rounded text-xs font-bold transition-all
                  ${isActive
                    ? 'text-white border border-transparent'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/80'
                  }
                `}
                style={isActive ? { backgroundColor: teamColor } : undefined}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
      {/* Line 2: opponent + home/away */}
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-white/80 text-sm font-medium">{fixture.opponent}</span>
        <span className="text-white/30 text-xs">{fixture.home ? 'H' : 'A'}</span>
      </div>
    </div>
  )
}
