import { TrophySlider } from './TrophySlider'

export interface TrophyValues {
  epl: number
  cl: number
  fa: number
  lc: number
}

interface SliderPanelProps {
  values: TrophyValues
  onChange: (key: keyof TrophyValues, value: number) => void
  eplSynced?: boolean
}

const TROPHIES: { key: keyof TrophyValues; label: string; emoji: string }[] = [
  { key: 'epl', label: 'Premier League', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { key: 'cl', label: 'Champions League', emoji: '⭐' },
  { key: 'fa', label: 'FA Cup', emoji: '🏆' },
  { key: 'lc', label: 'League Cup', emoji: '🥇' },
]

export function SliderPanel({ values, onChange, eplSynced }: SliderPanelProps) {
  return (
    <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-bold text-white mb-1">
        How many trophies will Arsenal win this year?
      </h2>
      <p className="text-white/60 text-sm mb-6">
        Set your predicted probability for each trophy:
      </p>
      <div className="divide-y divide-white/10">
        {TROPHIES.map(({ key, label, emoji }) => (
          <div key={key}>
            <TrophySlider
              label={label}
              emoji={emoji}
              value={values[key]}
              onChange={(val) => onChange(key, val)}
            />
            {key === 'epl' && eplSynced && (
              <p className="text-[#EF0107]/70 text-xs pb-2 -mt-1">
                ↑ Synced from Title Race predictor
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
