interface JinxLevelResult {
  label: string
  emoji: string
  colour: string
}

const LEVELS: Array<{ threshold: number } & JinxLevelResult> = [
  { threshold: 0.30, label: "You've cursed us all",    emoji: '☠️',  colour: 'text-red-500' },
  { threshold: 0.15, label: 'Peak jinx territory',      emoji: '🔥🔥🔥', colour: 'text-orange-500' },
  { threshold: 0.05, label: 'Dangerously optimistic',   emoji: '🔥🔥',   colour: 'text-yellow-400' },
  { threshold: 0.01, label: 'Cautiously optimistic',    emoji: '🔥',     colour: 'text-yellow-200' },
  { threshold: 0,    label: 'Measured and realistic',   emoji: '😌',     colour: 'text-green-400' },
]

export function getJinxLevel(quadrupleProb: number): JinxLevelResult {
  for (const level of LEVELS) {
    if (quadrupleProb >= level.threshold) {
      return { label: level.label, emoji: level.emoji, colour: level.colour }
    }
  }
  return { label: 'Measured and realistic', emoji: '😌', colour: 'text-green-400' }
}

interface JinxLevelProps {
  quadrupleProb: number
}

export function JinxLevel({ quadrupleProb }: JinxLevelProps) {
  const { label, emoji, colour } = getJinxLevel(quadrupleProb)
  const pct = (quadrupleProb * 100).toFixed(1)

  return (
    <section className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
      <p className="text-white/50 text-sm uppercase tracking-widest mb-2">Jinx Level</p>
      <div className="text-4xl mb-3">{emoji}</div>
      <p className={`text-2xl font-black ${colour}`}>{label}</p>
      <p className="text-white/40 text-sm mt-2">
        Quadruple probability: <span className="text-white/70 font-semibold">{pct}%</span>
      </p>
    </section>
  )
}
