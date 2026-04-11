import { useState } from 'react'
import { useIpAddress } from './use-ip-address.ts'
import { copyToClipboard } from '../../../../utils/copy-to-clipboard.ts'

export function IpAddress() {
  const { ipv4, ipv6, loading, isOnline } = useIpAddress()
  const [copied, setCopied] = useState(false)

  if (!isOnline) {
    return <span className="text-[10px] text-red-400 tracking-wide">offline</span>
  }

  const hasAny = loading || ipv4 != null || ipv6 != null
  const copyValue = [ipv4, ipv6].filter(Boolean).join(' · ')

  async function handleCopy() {
    if (!copyValue || loading) return
    const ok = await copyToClipboard(copyValue)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Click to copy IP'}
      className="flex flex-row items-center gap-1 max-w-full overflow-hidden text-[10px] text-(--text-muted) tracking-wide tabular-nums cursor-pointer hover:text-slate-300 active:opacity-60 transition-colors select-none [touch-action:manipulation]"
    >
      {copied ? (
        <span className="text-green-400 shrink-0">copied!</span>
      ) : (
        <>
          {!hasAny && <span className="opacity-50 shrink-0">local</span>}
          {(loading || ipv4 != null) && (
            <span className="shrink-0">{loading ? '…' : ipv4}</span>
          )}
          {(loading || ipv6 != null) && (
            <>
              {/* Desktop: full IPv6 with separator */}
              <span className="opacity-30 shrink-0 hidden sm:inline">·</span>
              <span
                className="hidden sm:inline truncate max-w-[10rem] lg:max-w-[16rem]"
                title={ipv6 ?? undefined}
              >
                {loading ? '…' : ipv6}
              </span>
              {/* Mobile: compact "(+ipv6)" badge when both are available */}
              {!loading && ipv4 != null && ipv6 != null && (
                <span className="sm:hidden opacity-60 shrink-0">(+ipv6)</span>
              )}
            </>
          )}
          {/* Mobile: red "(no ipv6)" when IPv4 is present but IPv6 is not */}
          {!loading && ipv4 != null && ipv6 == null && (
            <span className="sm:hidden text-red-400 shrink-0">(no ipv6)</span>
          )}
        </>
      )}
    </button>
  )
}
