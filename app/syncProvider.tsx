'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '@/app/lib/store';
import { syncPendingBookings } from '@/app/lib/slices/bookingsSlice';
import {useOnlineStatus} from '@/app/lib/useOnlineStatus';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      dispatch(syncPendingBookings());
    }
  }, [isOnline, dispatch]);

  return <>{children}</>;
}