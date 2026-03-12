export interface SliderValues {
  epl: number
  cl: number
  fa: number
  lc: number
}

export const DEFAULT_VALUES: SliderValues = {
  epl: 70,
  cl: 30,
  fa: 60,
  lc: 50,
}

const KEYS = ['epl', 'cl', 'fa', 'lc'] as const

export function encodeToUrl(values: SliderValues): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of KEYS) {
    params.set(key, String(values[key]))
  }
  return params
}

export function decodeFromUrl(params: URLSearchParams): SliderValues {
  const result = { ...DEFAULT_VALUES }
  for (const key of KEYS) {
    const raw = params.get(key)
    if (raw !== null) {
      const num = Number(raw)
      if (!isNaN(num)) {
        result[key] = Math.min(100, Math.max(0, Math.round(num)))
      }
    }
  }
  return result
}
