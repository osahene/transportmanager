import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { snakeToCamel } from "../snakeToCamel";
import { Booking, BookingStatus } from "../../types/booking";
import apiService from "../services/APIPath";
import axios from "axios";


const getErrorMessage = (error: any) => {
  return error.response?.data?.message || error.message || "An error occurred";
};
interface BookingsState {
  bookings: Booking[];
  detailedBookings: Record<string, any>;
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
  detailedBookings: {},
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
  async (params?: any) => {
    const response = await apiService.fetchBookings(params);
    console.log('book', response)
    const converted = snakeToCamel(response.data.results);
    // Add CarId and customerId for selector compatibility
    return converted.map((b: any) => ({
      ...b,
      CarId: b.car,
      customerId: b.customer,
    }));
  }
);
export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getBookingById(bookingId);  // you may need to add this method to apiService
      return snakeToCamel(response.data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
// NEW: Create booking thunk that sends data to backend
export const bookingSMSSending = createAsyncThunk(
  "bookings/create",
  async (bookingData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.bookingSMS(bookingData);
      return response.data;

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          alert(error.response?.data || { message: "Failed to send SMS" })
        );
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
export const createBooking = createAsyncThunk(
  "bookings/create",
  async (bookingData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.createBooking(bookingData);
      console.log("Create booking response:", response);
      return response.data.results;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data || { message: "Failed to create booking" }
        );
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);


export const checkCarAvailability = createAsyncThunk(
  "bookings/checkAvailability",
  async ({ carId, startDate, endDate }: {
    carId: string; startDate: string; endDate: string;
  },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.checkAvailability({
        car_id: carId,
        start_date: startDate,
        end_date: endDate,
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

// export const fetchBookingsByCarId = createAsyncThunk(
//   "bookings/fetchByCarId",
//   async (carId: string) => {
//     const response = await apiService.get(`/bookings?carId=${carId}`);
//     return response.data;
//   }
// );



export const markBookingAsReturned = createAsyncThunk(
  'bookings/markReturned',
  async (payload: { bookingId: string; actualReturnTime: string; returnMileage?: number }) => {
    const response = await apiService.markBookingAsReturned(payload.bookingId, {
      actual_return_time: payload.actualReturnTime,
      return_mileage: payload.returnMileage,
    });
    return response.data;
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelWithRefund',
  async (payload: { bookingId: string; refundAmount: number; reason: string }) => {
    const response = await apiService.cancelBooking(payload.bookingId, {
      refund_amount: payload.refundAmount,
      reason: payload.reason,
    });
    return response.data;
  }
);

export const sendSMS = createAsyncThunk(
  'bookings/sendSMS',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.sendSMSReceipt(bookingId);
      if (response.status === 200) {
        alert("SMS sent successfull")
      }
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)
export const sendEmail = createAsyncThunk(
  'bookings/sendEmail',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.sendEmailReceipt(bookingId);
      if (response.status === 200) {
        alert("SMS sent successfull")
      }
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

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
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        const booking = action.payload;
        state.detailedBookings[booking.id] = booking;
        state.selectedBooking = booking;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
        state.selectedBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to create booking";
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
      });
  },
});

export const {
  setSelectedBooking,
  setFilters,
  clearBookingFilters,
  // createBooking,
} = bookingsSlice.actions;
export default bookingsSlice.reducer;
