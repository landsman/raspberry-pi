import { useIpAddress } from '../hooks/use-ip-address.ts'

export function IpAddress() {
  const { ip, loading } = useIpAddress()

  return (
    <div className="text-[11px] text-(--text-muted) tracking-wide">
      IP: {loading ? '...' : ip}
    </div>
  )
}
