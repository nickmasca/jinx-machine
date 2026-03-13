import {
  ARSENAL_REMAINING,
  ARSENAL_CURRENT_POINTS,
  CITY_REMAINING,
  CITY_CURRENT_POINTS,
} from '../data/fixtures'
import { projectPoints, gapToEplProbability, titleLeader } from '../lib/titleRace'
import type { MatchResult } from '../lib/titleRace'
import { FixtureRow } from './FixtureRow'

export interface FixtureResults {
  arsenal: Record<string, MatchResult>
  city: Record<string, MatchResult>
}

interface TitleRaceTabProps {
  results: FixtureResults
  onResultChange: (team: 'arsenal' | 'city', fixtureId: string, result: MatchResult) => void
  onEplChange: (epl: number) => void
}

const ARSENAL_RED = '#EF0107'
const CITY_BLUE = '#6CABDD'

export function TitleRaceTab({ results, onResultChange, onEplChange }: TitleRaceTabProps) {
  const arsenalResults = ARSENAL_REMAINING.map((f) => results.arsenal[f.id] ?? null)
  const cityResults = CITY_REMAINING.map((f) => results.city[f.id] ?? null)

  const arsenalPts = projectPoints(ARSENAL_CURRENT_POINTS, arsenalResults)
  const cityPts = projectPoints(CITY_CURRENT_POINTS, cityResults)
  const eplProb = gapToEplProbability(arsenalPts, cityPts)
  const leader = titleLeader(arsenalPts, cityPts)

  function handleResultChange(team: 'arsenal' | 'city', fixtureId: string, result: MatchResult) {
    onResultChange(team, fixtureId, result)
    // Compute updated EPL probability immediately for auto-sync
    const newArsenalResults = ARSENAL_REMAINING.map((f) =>
      f.id === fixtureId && team === 'arsenal' ? result : (results.arsenal[f.id] ?? null)
    )
    const newCityResults = CITY_REMAINING.map((f) =>
      f.id === fixtureId && team === 'city' ? result : (results.city[f.id] ?? null)
    )
    const newArsenalPts = projectPoints(ARSENAL_CURRENT_POINTS, newArsenalResults)
    const newCityPts = projectPoints(CITY_CURRENT_POINTS, newCityResults)
    onEplChange(gapToEplProbability(newArsenalPts, newCityPts))
  }

  const outcomeText =
    leader === 'arsenal'
      ? 'Arsenal lead the title race 🏆'
      : leader === 'city'
        ? 'Man City lead the title race 🔵'
        : 'Title race is level'

  const outcomeColor =
    leader === 'arsenal' ? ARSENAL_RED : leader === 'city' ? CITY_BLUE : '#888'

  return (
    <div className="space-y-6">
      {/* Two-column fixture grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Arsenal column */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-bold text-sm" style={{ color: ARSENAL_RED }}>Arsenal</h3>
            <span
              data-testid="arsenal-points"
              className="text-2xl font-black tabular-nums"
              style={{ color: ARSENAL_RED }}
            >
              {arsenalPts}
            </span>
          </div>
          <div className="space-y-0.5">
            {ARSENAL_REMAINING.map((fixture) => (
              <FixtureRow
                key={fixture.id}
                fixture={fixture}
                result={results.arsenal[fixture.id] ?? null}
                teamColor={ARSENAL_RED}
                onChange={(r) => handleResultChange('arsenal', fixture.id, r)}
              />
            ))}
          </div>
        </div>

        {/* Man City column */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-bold text-sm" style={{ color: CITY_BLUE }}>Man City</h3>
            <span
              data-testid="city-points"
              className="text-2xl font-black tabular-nums"
              style={{ color: CITY_BLUE }}
            >
              {cityPts}
            </span>
          </div>
          <div className="space-y-0.5">
            {CITY_REMAINING.map((fixture) => (
              <FixtureRow
                key={fixture.id}
                fixture={fixture}
                result={results.city[fixture.id] ?? null}
                teamColor={CITY_BLUE}
                onChange={(r) => handleResultChange('city', fixture.id, r)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Outcome banner */}
      <div
        data-testid="title-outcome"
        className="rounded-xl p-4 text-center space-y-1 border border-white/10"
        style={{ backgroundColor: `${outcomeColor}20` }}
      >
        <p className="font-bold text-sm" style={{ color: outcomeColor }}>
          {outcomeText}
        </p>
        <p className="text-white/50 text-xs">
          Projected: Arsenal {arsenalPts} pts — Man City {cityPts} pts
        </p>
        <p className="text-white/70 text-sm mt-2">
          Arsenal EPL probability:{' '}
          <span className="font-bold" style={{ color: ARSENAL_RED }}>
            {eplProb}%
          </span>
          <span className="text-white/30 text-xs ml-1">(auto-synced to Trophy Machine)</span>
        </p>
      </div>

      <p className="text-white/30 text-xs text-center px-4">
        Points as of 13 March 2026. Fixtures subject to rescheduling.
        Probability is based on projected points gap, not a statistical model.
      </p>
    </div>
  )
}
