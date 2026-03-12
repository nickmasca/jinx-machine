import { useState } from 'react'
import { encodeToUrl } from '../lib/urlState'
import type { SliderValues } from '../lib/urlState'

interface ShareButtonProps {
  values: SliderValues
}

export function ShareButton({ values }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const params = encodeToUrl(values)
    const url = `${window.location.href.split('?')[0]}?${params.toString()}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy link to share"
      className="
        flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold
        bg-white/10 hover:bg-white/20 border border-white/20
        text-white transition-all active:scale-95
      "
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span>Copy Link to Share</span>
        </>
      )}
    </button>
  )
}
