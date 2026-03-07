import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from '../../types/booking';

// Helper to generate temp ID (can be moved to utils)
const generateTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface BookingsState {
  pendingSync: Booking[]; // offline bookings waiting to be synced
  selectedBookingId: string | null;
  filters: {
    status: string;
    searchTerm: string;
    // add other filters as needed
  };
}

const initialState: BookingsState = {
  pendingSync: [],
  selectedBookingId: null,
  filters: {
    status: 'all',
    searchTerm: '',
  },
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setSelectedBookingId: (state, action: PayloadAction<string | null>) => {
      state.selectedBookingId = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<BookingsState['filters']>>) => {
      Object.assign(state.filters, action.payload);
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    addOfflineBooking: (state, action: PayloadAction<Booking>) => {
      const booking = {
        ...action.payload,
        id: action.payload.id || generateTempId(),
        synced: false,
      };
      state.pendingSync.push(booking);
    },
    removeSyncedBooking: (state, action: PayloadAction<string>) => {
      state.pendingSync = state.pendingSync.filter((b) => b.id !== action.payload);
    },
    clearPendingSync: (state) => {
      state.pendingSync = [];
    },
  },
});

export const {
  setSelectedBookingId,
  setFilters,
  clearFilters,
  addOfflineBooking,
  removeSyncedBooking,
  clearPendingSync,
} = bookingsSlice.actions;
export default bookingsSlice.reducer;