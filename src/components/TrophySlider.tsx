interface TrophySliderProps {
  label: string
  emoji: string
  value: number
  onChange: (value: number) => void
}

export function TrophySlider({ label, emoji, value, onChange }: TrophySliderProps) {
  return (
    <div className="flex items-center gap-4 py-3">
      <span className="text-2xl w-8 flex-shrink-0" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-white font-medium w-44 flex-shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 appearance-none rounded-full cursor-pointer
          bg-white/20
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#EF0107]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-webkit-slider-thumb]:transition-transform"
        aria-label={`${label} probability`}
        style={{
          background: `linear-gradient(to right, #EF0107 ${value}%, rgba(255,255,255,0.2) ${value}%)`,
        }}
      />
      <span className="text-[#DAAF47] font-bold text-lg w-14 text-right flex-shrink-0">
        {value}%
      </span>
    </div>
  )
}
