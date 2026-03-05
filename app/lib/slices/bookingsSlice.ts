import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { snakeToCamel } from "../snakeToCamel";
import { Booking, BookingStatus } from "../../types/booking";
import { RootState } from "../store";
import apiService from "../services/APIPath";
import axios from "axios";


const getErrorMessage = (error: any) => {
  return error.response?.data?.message || error.message || "An error occurred";
};

// Helper to generate temporary IDs for offline records
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface BookingsState {
  bookings: Booking[];
  pendingSync: Booking[];
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
  pendingSync: [],
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


// Convert a locally stored booking (from pendingSync) to backend API format
const prepareBackendPayloadFromLocalBooking = (localBooking: any) => {
  const payload: any = {
    car: localBooking.carId || localBooking.car?.id,
    start_date: localBooking.startDate || localBooking.dates?.start,
    end_date: localBooking.endDate || localBooking.dates?.end,
    daily_rate: localBooking.dailyRate,
    discount: localBooking.discount,
    pickup_location: localBooking.pickupLocation,
    dropoff_location: localBooking.dropoffLocation,
    special_requests: localBooking.specialRequests,
    payment_method: localBooking.paymentMethod,
    is_self_drive: localBooking.selfDrive === "true" || localBooking.selfDrive === true,
  };

  // Customer / guarantor handling
  if (localBooking.customer?.id && !localBooking.customer.id.startsWith('temp_')) {
    payload.customer = localBooking.customer.id;
    if (localBooking.customer.guarantor?.id) {
      payload.guarantor = localBooking.customer.guarantor.id;
    }
  } else {
    // New customer data
    payload.customer_data = {
      first_name: localBooking.customer?.firstName,
      last_name: localBooking.customer?.lastName,
      email: localBooking.customer?.email,
      phone: localBooking.customer?.phone,
      ghana_card_id: localBooking.customer?.ghanaCardId,
      occupation: localBooking.customer?.occupation,
      gps_address: localBooking.customer?.gpsAddress,
      address_city: localBooking.customer?.address?.city,
      address_region: localBooking.customer?.address?.region,
      address_country: localBooking.customer?.address?.country,
      communication_preferences: localBooking.customer?.communicationPreferences,
    };
    if (localBooking.customer?.guarantor) {
      payload.guarantor_data = {
        first_name: localBooking.customer.guarantor.firstName,
        last_name: localBooking.customer.guarantor.lastName,
        phone: localBooking.customer.guarantor.phone,
        email: localBooking.customer.guarantor.email,
        ghana_card_id: localBooking.customer.guarantor.ghanaCardId,
        occupation: localBooking.customer.guarantor.occupation,
        gps_address: localBooking.customer.guarantor.gpsAddress,
        relationship: localBooking.customer.guarantor.relationship,
        address_city: localBooking.customer.guarantor.address?.city,
        address_region: localBooking.customer.guarantor.address?.region,
        address_country: localBooking.customer.guarantor.address?.country,
      };
    }
  }

  // Driver / self‑drive
  if (payload.is_self_drive) {
    payload.driver_license_id = localBooking.driverLicenseId;
    payload.driver_license_class = localBooking.driverLicenseClass;
    payload.driver_license_issue_date = localBooking.driverLicenseIssueDate;
    payload.driver_license_expiry_date = localBooking.driverLicenseExpiryDate;
  } else {
    payload.driver = localBooking.driver?.id;
  }

  // Payment method specifics
  if (localBooking.paymentMethod === 'mobile_money') {
    payload.mobile_money_provider = localBooking.paymentData?.mobileMoneyDetails?.provider;
    payload.mobile_money_number = localBooking.paymentData?.mobileMoneyDetails?.phoneNumber;
    payload.mobile_money_transaction_id = localBooking.paymentData?.mobileMoneyDetails?.transactionId;
  } else if (localBooking.paymentMethod === 'pay_in_slip') {
    payload.pay_in_slip_bank = localBooking.paymentData?.payInSlipDetails?.bankName;
    payload.pay_in_slip_branch = localBooking.paymentData?.payInSlipDetails?.branch;
    payload.pay_in_slip_payee = localBooking.paymentData?.payInSlipDetails?.payeeName;
    payload.pay_in_slip_reference = localBooking.paymentData?.payInSlipDetails?.referenceNumber;
    payload.pay_in_slip_number = localBooking.paymentData?.payInSlipDetails?.slipNumber;
    payload.pay_in_slip_date = localBooking.paymentData?.payInSlipDetails?.paymentDate;
  }

  return payload;
};



export const syncPendingBookings = createAsyncThunk(
  'bookings/syncPending',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const pending = state.bookings.pendingSync;

    for (const booking of pending) {
      try {
        const payload = prepareBackendPayloadFromLocalBooking(booking);
        const response = await apiService.createBooking(payload);
        const realBooking = snakeToCamel(response.data); // adjust based on API response

        // Remove temp booking from pendingSync and from main list
        dispatch(removeSyncedBooking(booking.id));
        dispatch(removeTempBooking(booking.id)); // new action
        // Add the real booking
        dispatch(addRealBooking(realBooking));
      } catch (error) {
        console.error('Sync failed for booking', booking.id, error);
      }
    }
  }
);

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
      return response.data || response.data.results;
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
    addOfflineBooking: (state, action: PayloadAction<Booking>) => {
      const booking = { ...action.payload, id: generateTempId(), synced: false };
      state.pendingSync.push(booking);
      // Optionally also add to bookings list for immediate UI display
      state.bookings.push(booking);
    },
    removeSyncedBooking: (state, action: PayloadAction<string>) => {
      state.pendingSync = state.pendingSync.filter(b => b.id !== action.payload);
    },
    removeTempBooking: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter(b => b.id !== action.payload);
    },
    addRealBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.unshift(action.payload);
    },
    clearPendingSync: (state) => {
      state.pendingSync = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = (action.payload || []).filter((b: any) => b != null);
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
  addOfflineBooking,
  removeSyncedBooking,
  removeTempBooking,
  addRealBooking,
  clearPendingSync,
  // createBooking,
} = bookingsSlice.actions;
export default bookingsSlice.reducer;
