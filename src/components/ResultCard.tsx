interface ResultCardProps {
  label: string
  value: number
  description?: string
  highlight?: boolean
}

export function ResultCard({ label, value, description, highlight }: ResultCardProps) {
  const pct = (value * 100).toFixed(1) + '%'

  return (
    <div
      className={`
        rounded-xl p-4 flex flex-col items-center text-center transition-all
        ${highlight
          ? 'bg-[#EF0107]/20 border border-[#EF0107]/40'
          : 'bg-white/5 border border-white/10 hover:bg-white/10'
        }
      `}
    >
      <span className="text-white/70 text-sm font-medium uppercase tracking-wide mb-2">
        {label}
      </span>
      <span className={`font-black text-3xl ${highlight ? 'text-[#EF0107]' : 'text-[#DAAF47]'}`}>
        {pct}
      </span>
      {description && (
        <span className="text-white/40 text-xs mt-2">{description}</span>
      )}
    </div>
  )
}
