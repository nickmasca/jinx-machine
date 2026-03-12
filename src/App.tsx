import { useState, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Header } from './components/Header'
import { SliderPanel } from './components/SliderPanel'
import { ResultsGrid } from './components/ResultsGrid'
import { Distribution } from './components/Distribution'
import { JinxLevel } from './components/JinxLevel'
import { ShareButton } from './components/ShareButton'
import { quadruple } from './lib/probability'
import { decodeFromUrl, DEFAULT_VALUES } from './lib/urlState'
import type { TrophyValues } from './components/SliderPanel'

function App() {
  const [values, setValues] = useState<TrophyValues>(() => {
    const params = new URLSearchParams(window.location.search)
    return decodeFromUrl(params)
  })

  // Keep URL in sync as sliders change (without adding history entries)
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
  }

  function handleReset() {
    setValues(DEFAULT_VALUES)
  }

  // Convert integer percentages (0-100) to decimal (0-1) for probability functions
  const probs = {
    epl: values.epl / 100,
    cl: values.cl / 100,
    fa: values.fa / 100,
    lc: values.lc / 100,
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      {/* Subtle Arsenal-red gradient glow at the top */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#EF0107]/10 to-transparent pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 pb-16">
        <Header />

        <div className="space-y-6">
          {/* Sliders */}
          <SliderPanel values={values} onChange={handleChange} />

          {/* Results */}
          <ResultsGrid probs={probs} />

          {/* Distribution chart */}
          <Distribution probs={probs} />

          {/* Jinx level */}
          <JinxLevel quadrupleProb={quadruple(probs)} />

          {/* Assumptions note */}
          <p className="text-white/30 text-xs text-center px-4">
            Assumes trophy outcomes are independent events. This is a simplifying assumption —
            in reality, a strong squad that wins the league probably increases chances elsewhere.
          </p>

          {/* Actions */}
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
      </div>
      <Analytics />
    </div>
  )
}

export default App
