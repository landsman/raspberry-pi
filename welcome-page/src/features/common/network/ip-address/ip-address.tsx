import { useIpAddress } from './use-ip-address.ts'

export function IpAddress() {
  const { ipv4, ipv6, loading, isOnline } = useIpAddress()

  if (!isOnline) {
    return <span className="text-[10px] text-red-400 tracking-wide">offline</span>
  }

  const hasAny = loading || ipv4 != null || ipv6 != null

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-(--text-muted) tracking-wide tabular-nums">
      {!hasAny && <span className="opacity-50">local</span>}
      {(loading || ipv4 != null) && <span>{loading ? '…' : ipv4}</span>}
      {(loading || ipv6 != null) && (
        <>
          {(loading || ipv4 != null) && <span className="opacity-30">·</span>}
          <span>{loading ? '…' : ipv6}</span>
        </>
      )}
    </div>
  )
}
