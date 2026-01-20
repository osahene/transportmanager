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

// export const createBooking = createAsyncThunk(
//   "bookings/create",
//   async ({ CarId, payload }: { CarId: string; payload: Booking }) => {
//     const response = await api.patch(`/Cars/${CarId}/payload`, { payload });
//     console.log("booking res", response);
//     return response.data;
//   }
// );

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

export const markBookingAsReturned = createAsyncThunk(
  "bookings/markReturned",
  async (
    {
      bookingId,
      actualReturnTime,
      penaltyAmount,
      penaltyPaid,
      penaltyPaymentMethod,
      receiptNumber,
    }: {
      bookingId: string;
      actualReturnTime: string;
      penaltyAmount: number;
      penaltyPaid: boolean;
      penaltyPaymentMethod: "cash" | "mobile_money";
      receiptNumber: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/bookings/${bookingId}/mark_as_returned/`,
        {
          actual_return_time: actualReturnTime,
          penalty_amount: penaltyAmount,
          penalty_paid: penaltyPaid,
          penalty_payment_method: penaltyPaymentMethod,
          receipt_number: receiptNumber,
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to mark booking as returned"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const cancelBookingWithRefund = createAsyncThunk(
  "bookings/cancelWithRefund",
  async (
    {
      bookingId,
      refundAmount,
      reason,
    }: {
      bookingId: string;
      refundAmount: number;
      reason: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/bookings/${bookingId}/cancel_with_refund/`,
        {
          refund_amount: refundAmount,
          reason,
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to cancel booking"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const checkCarAvailability = createAsyncThunk(
  "bookings/checkAvailability",
  async (
    {
      carId,
      startDate,
      endDate,
    }: {
      carId: string;
      startDate: string;
      endDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`/bookings/check_availability/`, {
        params: { car_id: carId, start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to check availability"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    createBooking: (state, action) => {
      state.bookings.unshift(action.payload);
    },
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
      // Revert and use this one instead
      // .addCase(createBooking.fulfilled, (state, action) => {
      //   console.log("create booking", createBooking);
      //   state.bookings.unshift(action.payload);
      //   console.log("did it");
      // })
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
      })
      .addCase(markBookingAsReturned.fulfilled, (state, action) => {
        const updatedBooking = action.payload.booking;
        const index = state.bookings.findIndex(
          (b) => b.id === updatedBooking.id
        );
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
        if (state.selectedBooking?.id === updatedBooking.id) {
          state.selectedBooking = updatedBooking;
        }
      })
      .addCase(cancelBookingWithRefund.fulfilled, (state, action) => {
        const updatedBooking = action.payload.booking;
        const index = state.bookings.findIndex(
          (b) => b.id === updatedBooking.id
        );
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
        if (state.selectedBooking?.id === updatedBooking.id) {
          state.selectedBooking = updatedBooking;
        }
      });
  },
});

export const {
  setSelectedBooking,
  setFilters,
  clearBookingFilters,
  createBooking,
} = bookingsSlice.actions;
export default bookingsSlice.reducer;
