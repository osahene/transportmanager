import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Booking, BookingStatus } from "../../types/booking";
import { api } from "../services/api";
import axios from "axios";

interface BookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: BookingStatus | "all";
    dateRange: { start: string; end: string };
    customerId?: string;
    CarId?: string;
  };
}

const initialState: BookingsState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
  filters: {
    status: "all",
    dateRange: {
      start: new Date().toISOString().split("T")[0],
      end: new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split("T")[0],
    },
  },
};

// Async thunks
export const fetchBookings = createAsyncThunk(
  "bookings/fetchAll",
  async (params?: { carId?: string; customerId?: string }) => {
    const response = await api.get("/bookings", { params });
    return response.data;
  }
);

export const fetchBookingsByCarId = createAsyncThunk(
  "bookings/fetchByCarId",
  async (carId: string) => {
    const response = await api.get(`/bookings?carId=${carId}`);
    return response.data;
  }
);

export const createBooking = createAsyncThunk(
  "bookings/create",
  async ({ CarId, payload }: { CarId: string; payload: Booking }) => {
    const response = await api.patch(`/Cars/${CarId}/payload`, { payload });
    return response.data;
  }
);

export const cancelBooking = createAsyncThunk(
  "bookings/cancel",
  async (
    {
      bookingId,
      reason,
      refundAmount,
    }: {
      bookingId: string;
      reason: string;
      refundAmount?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`, {
        reason,
        refundAmount,
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to create maintenance record"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const checkAvailability = createAsyncThunk(
  "bookings/checkAvailability",
  async ({
    CarId,
    startDate,
    endDate,
  }: {
    CarId: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.get(`/Cars/${CarId}/availability`, {
      params: { startDate, endDate },
    });
    return response.data;
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearBookingFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch bookings";
      })
      .addCase(fetchBookingsByCarId.fulfilled, (state, action) => {
        state.bookings = action.payload;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload);
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      });
  },
});

export const { setSelectedBooking, setFilters, clearBookingFilters } =
  bookingsSlice.actions;
export default bookingsSlice.reducer;
