'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function GroupActions() {
  const router = useRouter()
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle')
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!groupName.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: groupName }),
    })
    const data = (await res.json()) as { id?: string; error?: string }
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Failed'); return }
    router.push(`/league/${data.id}`)
  }

  async function handleJoin() {
    const code = inviteCode.trim().toUpperCase()
    if (!code) return
    setLoading(true)
    setError('')
    // Look up group by invite code first
    const res = await fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: code }),
    })
    const data = (await res.json()) as { groupId?: string; error?: string }
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Invalid code'); return }
    router.push(`/league/${data.groupId}`)
    router.refresh()
  }

  if (mode === 'idle') {
    return (
      <div className="flex gap-3">
        <button
          onClick={() => setMode('create')}
          className="flex-1 py-3 rounded-xl bg-[#EF0107] hover:bg-[#EF0107]/80 text-white font-semibold text-sm transition-all"
        >
          + Create group
        </button>
        <button
          onClick={() => setMode('join')}
          className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all"
        >
          Join with code
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
      <h3 className="text-white font-semibold">
        {mode === 'create' ? 'Create a group' : 'Join a group'}
      </h3>

      {mode === 'create' ? (
        <input
          type="text"
          placeholder="Group name (e.g. The Gooners)"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#EF0107]/60"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
      ) : (
        <input
          type="text"
          placeholder="Enter invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 text-sm font-mono focus:outline-none focus:border-[#EF0107]/60"
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={mode === 'create' ? handleCreate : handleJoin}
          disabled={loading}
          className="flex-1 py-2 rounded-lg bg-[#EF0107] hover:bg-[#EF0107]/80 text-white font-semibold text-sm disabled:opacity-50 transition-all"
        >
          {loading ? 'Saving…' : mode === 'create' ? 'Create' : 'Join'}
        </button>
        <button
          onClick={() => { setMode('idle'); setError('') }}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
