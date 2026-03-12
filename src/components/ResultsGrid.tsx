import { ResultCard } from './ResultCard'
import {
  quadruple,
  trophyless,
  atLeastOne,
  classicTreble,
  eplPlusAtLeastOneOther,
  atLeastDouble,
} from '../lib/probability'
import type { Probabilities } from '../lib/probability'

interface ResultsGridProps {
  probs: Probabilities
}

export function ResultsGrid({ probs }: ResultsGridProps) {
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">The Verdict</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ResultCard
          label="Quadruple"
          value={quadruple(probs)}
          description="All 4 trophies"
          highlight
        />
        <ResultCard
          label="At Least 1 Trophy"
          value={atLeastOne(probs)}
        />
        <ResultCard
          label="Trophyless"
          value={trophyless(probs)}
          description="No trophies at all"
        />
        <ResultCard
          label="Classic Treble"
          value={classicTreble(probs)}
          description="EPL + CL + FA Cup"
        />
        <ResultCard
          label="EPL + 1 Other"
          value={eplPlusAtLeastOneOther(probs)}
          description="League + any cup"
        />
        <ResultCard
          label="Any Double"
          value={atLeastDouble(probs)}
          description="At least 2 trophies"
        />
      </div>
    </section>
  )
}
