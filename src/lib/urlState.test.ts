import { describe, it, expect } from 'vitest'
import { encodeToUrl, decodeFromUrl, DEFAULT_VALUES } from './urlState'

const sample = { epl: 70, cl: 30, fa: 60, lc: 50 }

describe('encodeToUrl', () => {
  it('encodes all four values as query params', () => {
    const params = encodeToUrl(sample)
    expect(params.get('epl')).toBe('70')
    expect(params.get('cl')).toBe('30')
    expect(params.get('fa')).toBe('60')
    expect(params.get('lc')).toBe('50')
  })

  it('encodes 0 values', () => {
    const params = encodeToUrl({ epl: 0, cl: 0, fa: 0, lc: 0 })
    expect(params.get('epl')).toBe('0')
  })

  it('encodes 100 values', () => {
    const params = encodeToUrl({ epl: 100, cl: 100, fa: 100, lc: 100 })
    expect(params.get('cl')).toBe('100')
  })
})

describe('decodeFromUrl', () => {
  it('decodes all four values from query params', () => {
    const params = new URLSearchParams('epl=70&cl=30&fa=60&lc=50')
    const result = decodeFromUrl(params)
    expect(result).toEqual(sample)
  })

  it('returns default values when params are missing', () => {
    const params = new URLSearchParams('')
    const result = decodeFromUrl(params)
    expect(result).toEqual(DEFAULT_VALUES)
  })

  it('returns default values for missing individual params', () => {
    const params = new URLSearchParams('epl=80')
    const result = decodeFromUrl(params)
    expect(result.epl).toBe(80)
    expect(result.cl).toBe(DEFAULT_VALUES.cl)
    expect(result.fa).toBe(DEFAULT_VALUES.fa)
    expect(result.lc).toBe(DEFAULT_VALUES.lc)
  })

  it('clamps values above 100 to 100', () => {
    const params = new URLSearchParams('epl=150&cl=30&fa=60&lc=50')
    const result = decodeFromUrl(params)
    expect(result.epl).toBe(100)
  })

  it('clamps values below 0 to 0', () => {
    const params = new URLSearchParams('epl=-10&cl=30&fa=60&lc=50')
    const result = decodeFromUrl(params)
    expect(result.epl).toBe(0)
  })

  it('ignores non-numeric values and uses defaults', () => {
    const params = new URLSearchParams('epl=abc&cl=30&fa=60&lc=50')
    const result = decodeFromUrl(params)
    expect(result.epl).toBe(DEFAULT_VALUES.epl)
  })
})

describe('round-trip', () => {
  it('encodes and decodes back to the same values', () => {
    const encoded = encodeToUrl(sample)
    const decoded = decodeFromUrl(encoded)
    expect(decoded).toEqual(sample)
  })
})
