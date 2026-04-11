import { useIpAddress } from './use-ip-address.ts'

export function IpAddress() {
  const { ipv4, ipv6, loading, isOnline } = useIpAddress()

  return (
    <div className="flex flex-col gap-1 text-[11px] text-(--text-muted) tracking-wide">
      {!isOnline && <div className="text-red-400">offline</div>}
      <div>IPv4: {loading ? '...' : ipv4}</div>
      <div>IPv6: {loading ? '...' : ipv6}</div>
    </div>
  )
}
