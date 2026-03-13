export type Tab = 'trophy' | 'race'

interface TabBarProps {
  activeTab: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'trophy', label: 'Trophy Machine' },
  { id: 'race',   label: 'Title Race' },
]

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div role="tablist" className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
      {TABS.map(({ id, label }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`
              flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all
              ${isActive
                ? 'bg-[#EF0107] text-white shadow'
                : 'text-white/50 hover:text-white/80'
              }
            `}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
