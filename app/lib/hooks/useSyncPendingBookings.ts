import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../store';
import { removeSyncedBooking } from '../slices/bookingsSlice';
import { useOnlineStatus } from '../useOnlineStatus';
import apiService from '../services/APIPath';

// Helper to convert a local booking to backend payload (same as before)
const prepareBackendPayloadFromLocalBooking = (localBooking: any) => {
  // Copy the existing function from your bookingsSlice here
  // (I'll assume you have it defined elsewhere)
};

export const useSyncPendingBookings = () => {
  const isOnline = useOnlineStatus();
  const pendingSync = useAppSelector((state) => state.bookings.pendingSync);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOnline || pendingSync.length === 0) return;

    const sync = async () => {
      for (const booking of pendingSync) {
        try {
          const payload = prepareBackendPayloadFromLocalBooking(booking);
          await apiService.createBooking(payload);
          // After successful sync, invalidate the bookings query
          await queryClient.invalidateQueries({ queryKey: ['bookings'] });
          dispatch(removeSyncedBooking(booking.id));
        } catch (error) {
          console.error('Sync failed for booking', booking.id, error);
          // You may want to implement retry logic or mark as failed
        }
      }
    };

    sync();
  }, [isOnline, pendingSync, dispatch, queryClient]);
};