'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { SliderPanel } from '@/components/SliderPanel'
import { ResultsGrid } from '@/components/ResultsGrid'
import { Distribution } from '@/components/Distribution'
import { JinxLevel } from '@/components/JinxLevel'
import { ShareButton } from '@/components/ShareButton'
import { TabBar } from '@/components/TabBar'
import { TitleRaceTab } from '@/components/TitleRaceTab'
import { quadruple } from '@/lib/probability'
import { decodeFromUrl, DEFAULT_VALUES } from '@/lib/urlState'
import { ARSENAL_REMAINING, CITY_REMAINING } from '@/data/fixtures'
import type { TrophyValues } from '@/components/SliderPanel'
import type { Tab } from '@/components/TabBar'
import type { FixtureResults } from '@/components/TitleRaceTab'
import type { MatchResult } from '@/lib/titleRace'
import Link from 'next/link'

function buildEmptyResults(): FixtureResults {
  return {
    arsenal: Object.fromEntries(ARSENAL_REMAINING.map((f) => [f.id, null as MatchResult])),
    city: Object.fromEntries(CITY_REMAINING.map((f) => [f.id, null as MatchResult])),
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('trophy')
  const [values, setValues] = useState<TrophyValues>(() => {
    if (typeof window === 'undefined') return DEFAULT_VALUES
    const params = new URLSearchParams(window.location.search)
    return decodeFromUrl(params)
  })
  const [fixtureResults, setFixtureResults] = useState<FixtureResults>(buildEmptyResults)
  const [eplSyncedFromRace, setEplSyncedFromRace] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('epl', String(values.epl))
    params.set('cl', String(values.cl))
    params.set('fa', String(values.fa))
    params.set('lc', String(values.lc))
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState(null, '', newUrl)
  }, [values])

  function handleChange(key: keyof TrophyValues, value: number) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (key === 'epl') setEplSyncedFromRace(false)
  }

  function handleReset() {
    setValues(DEFAULT_VALUES)
    setEplSyncedFromRace(false)
  }

  function handleResultChange(
    team: 'arsenal' | 'city',
    fixtureId: string,
    result: MatchResult
  ) {
    setFixtureResults((prev) => ({
      ...prev,
      [team]: { ...prev[team], [fixtureId]: result },
    }))
  }

  function handleEplChange(epl: number) {
    setValues((prev) => ({ ...prev, epl }))
    setEplSyncedFromRace(true)
  }

  const probs = {
    epl: values.epl / 100,
    cl: values.cl / 100,
    fa: values.fa / 100,
    lc: values.lc / 100,
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#EF0107]/10 to-transparent pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 pb-16">
        <Header />

        {/* League nav link */}
        <div className="flex justify-end mb-4">
          <Link
            href="/league"
            className="text-sm font-semibold text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5"
          >
            🏆 Jinx League
          </Link>
        </div>

        <TabBar activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'trophy' ? (
          <div className="space-y-6">
            <SliderPanel values={values} onChange={handleChange} eplSynced={eplSyncedFromRace} />
            <ResultsGrid probs={probs} />
            <Distribution probs={probs} />
            <JinxLevel quadrupleProb={quadruple(probs)} />
            <p className="text-white/30 text-xs text-center px-4">
              Assumes trophy outcomes are independent events. This is a simplifying assumption —
              in reality, a strong squad that wins the league probably increases chances elsewhere.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <ShareButton values={values} />
              <button
                onClick={handleReset}
                className="
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold
                  bg-transparent hover:bg-white/5 border border-white/20
                  text-white/60 hover:text-white transition-all
                "
              >
                🔄 Reset to defaults
              </button>
            </div>
          </div>
        ) : (
          <TitleRaceTab
            results={fixtureResults}
            onResultChange={handleResultChange}
            onEplChange={handleEplChange}
          />
        )}
      </div>
    </div>
  )
}
