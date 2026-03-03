'use client'
import { useOnlineStatus } from '@/app/lib/useOnlineStatus';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: '#f59e0b', color: '#000', padding: '8px', textAlign: 'center',
      zIndex: 9999
    }}>
      You're offline - Changes will sync when you reconnect
    </div>
  )
}