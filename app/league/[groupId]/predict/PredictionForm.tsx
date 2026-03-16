'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Fixture, Prediction } from '@/db/schema'

interface Props {
  fixtures: Fixture[]
  existingPredictions: Prediction[]
  groupId: string
}

interface ScoreInput {
  home: string
  away: string
}

const ARSENAL_NAMES = ['Arsenal FC', 'Arsenal']
const isArsenal = (name: string) => ARSENAL_NAMES.some((n) => name.includes(n))

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupByDate(fixtures: Fixture[]): { date: string; fixtures: Fixture[] }[] {
  const map = new Map<string, Fixture[]>()
  for (const f of fixtures) {
    const key = new Date(f.matchDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    const arr = map.get(key) ?? []
    arr.push(f)
    map.set(key, arr)
  }
  return Array.from(map.entries()).map(([date, fixtures]) => ({ date, fixtures }))
}

export function PredictionForm({ fixtures, existingPredictions, groupId }: Props) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, ScoreInput>>(() => {
    const init: Record<string, ScoreInput> = {}
    for (const f of fixtures) {
      const existing = existingPredictions.find((p) => p.fixtureId === f.id)
      init[f.id] = {
        home: existing ? String(existing.predictedHomeScore) : '',
        away: existing ? String(existing.predictedAwayScore) : '',
      }
    }
    return init
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function setScore(fixtureId: string, side: 'home' | 'away', value: string) {
    const clean = value.replace(/\D/g, '').slice(0, 2)
    setScores((prev) => ({ ...prev, [fixtureId]: { ...prev[fixtureId], [side]: clean } }))
    setSaved(false)
  }

  async function handleSubmit() {
    setError('')
    const toSubmit = fixtures
      .map((f) => {
        const s = scores[f.id]
        const home = parseInt(s.home)
        const away = parseInt(s.away)
        if (isNaN(home) || isNaN(away)) return null
        return { fixtureId: f.id, homeScore: home, awayScore: away }
      })
      .filter(Boolean) as { fixtureId: string; homeScore: number; awayScore: number }[]

    if (toSubmit.length === 0) {
      setError('Enter at least one prediction before saving.')
      return
    }

    setSaving(true)
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, predictions: toSubmit }),
    })
    const data = (await res.json()) as { saved?: number; error?: string }
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to save predictions.')
      return
    }

    setSaved(true)
    router.refresh()
  }

  const groups = groupByDate(fixtures)

  return (
    <div className="space-y-8">
      {groups.map(({ date, fixtures: dayFixtures }) => (
        <div key={date}>
          <h2 className="text-white/50 text-xs uppercase tracking-widest mb-3">{date}</h2>
          <div className="space-y-3">
            {dayFixtures.map((fixture) => {
              const isArsenalGame = isArsenal(fixture.homeTeam) || isArsenal(fixture.awayTeam)
              const score = scores[fixture.id] ?? { home: '', away: '' }
              const alreadySaved = existingPredictions.some((p) => p.fixtureId === fixture.id)

              return (
                <div
                  key={fixture.id}
                  className={`bg-white/5 border rounded-xl p-4 ${
                    isArsenalGame ? 'border-[#EF0107]/30' : 'border-white/10'
                  }`}
                >
                  {isArsenalGame && (
                    <p className="text-[#EF0107] text-xs font-semibold mb-2 uppercase tracking-wider">
                      ×2 Arsenal bonus
                    </p>
                  )}
                  <div className="text-white/30 text-xs mb-3">
                    {fixture.competition} · {formatDate(fixture.matchDate)}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-right text-sm font-semibold text-white">
                      {fixture.homeTeam}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={score.home}
                        onChange={(e) => setScore(fixture.id, 'home', e.target.value)}
                        className="w-10 text-center bg-white/10 border border-white/20 rounded-lg py-1.5 text-white font-bold text-sm focus:outline-none focus:border-[#EF0107]/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="–"
                      />
                      <span className="text-white/30 font-bold">:</span>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={score.away}
                        onChange={(e) => setScore(fixture.id, 'away', e.target.value)}
                        className="w-10 text-center bg-white/10 border border-white/20 rounded-lg py-1.5 text-white font-bold text-sm focus:outline-none focus:border-[#EF0107]/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="–"
                      />
                    </div>
                    <span className="flex-1 text-left text-sm font-semibold text-white">
                      {fixture.awayTeam}
                    </span>
                  </div>
                  {alreadySaved && (
                    <p className="text-white/30 text-xs mt-2 text-center">Saved ✓</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-3.5 rounded-xl bg-[#EF0107] hover:bg-[#EF0107]/80 text-white font-bold text-sm disabled:opacity-50 transition-all"
      >
        {saving ? 'Saving…' : saved ? 'Predictions saved ✓' : 'Save predictions'}
      </button>

      <p className="text-white/30 text-xs text-center">
        You can update predictions any time before kickoff.
      </p>
    </div>
  )
}
