import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Staff, SalaryPayment } from "../../types/staff"; // define types separately or inline
import apiService from "../services/APIPath";
import { snakeToCamel } from "../snakeToCamel";
interface StaffState {
  staff: Staff[];
  selectedStaff: Staff | null;
  salaryHistory: Record<string, SalaryPayment[]>;   // key: staffId
  driverBookings: Record<string, any[]>; // Store bookings by driver ID
  loading: boolean;
  error: string | null;
  filters: {
    department: string;
    status: string;
    employmentType: string;
  };
}

const initialState: StaffState = {
  staff: [],
  selectedStaff: null,
  salaryHistory: {},
  driverBookings: {},
  loading: false,
  error: null,
  filters: {
    department: "all",
    status: "active",
    employmentType: "all",
  },
};

// Async thunks
export const createStaff = createAsyncThunk(
  "staff/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.createStaff(data);
      return snakeToCamel(response.data.results) as Staff;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create staff");
    }
  }
);


export const fetchStaff = createAsyncThunk(
  "staff/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getStaff();
      const staffData = response.data.results.map((staff: any) => snakeToCamel(staff));
      console.log("Fetched staff data:", staffData); // Debug log
      return staffData as Staff[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch staff");
    }
  }
);

export const fetchStaffById = createAsyncThunk(
  "staff/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getStaffById(id);
      return snakeToCamel(response.data.results) as Staff;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch staff details");
    }
  }
);

export const fetchSalaryHistory = createAsyncThunk(
  "staff/fetchSalaryHistory",
  async (staffId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getSalaryHistory(staffId);
      console.log('staff salary history', response)
      return snakeToCamel(response.data.results) as SalaryPayment[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch salary history");
    }
  }
);

export const createSalaryPayment = createAsyncThunk(
  "staff/createSalaryPayment",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.createSalaryPayment(data);
      console.log('Created salary payment', response)
      return snakeToCamel(response.data) as SalaryPayment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create salary payment");
    }
  }
);

export const updateStaffStatus = createAsyncThunk(
  "staff/updateStatus",
  async ({ id, action, data }: { id: string; action: string; data?: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateStaffStatus(id, action, data);
      return snakeToCamel(response.data.results) as Staff;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update staff status");
    }
  }
);

export const fetchDriverBookings = createAsyncThunk(
  "staff/fetchDriverBookings",
  async (driverId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getDriverBookings(driverId);
      return snakeToCamel(response.data.results) as any[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch driver bookings");
    }
  }
);

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    setSelectedStaff: (state, action: PayloadAction<Staff | null>) => {
      state.selectedStaff = action.payload;
    },
    clearSalaryHistory: (state) => {
      state.salaryHistory = {}; // Clear salary history for all staff
    },
    setStaffFilter: (state, action: PayloadAction<{ key: keyof StaffState["filters"]; value: string }>) => {
      state.filters[action.payload.key] = action.payload.value;
    },
    resetStaffFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStaff.fulfilled, (state, action) => {
        state.staff.push(action.payload);
        state.loading = false;
      })
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalaryHistory.fulfilled, (state, action) => {
        const staffId = action.meta.arg;                 // staffId passed to thunk
        state.salaryHistory[staffId] = action.payload;
      })
      .addCase(fetchDriverBookings.fulfilled, (state, action) => {
        const driverId = action.meta.arg;
        state.driverBookings[driverId] = action.payload;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.staff = action.payload;
        } else {
          // Fallback if the API structure is different than expected
          console.error("Payload is not an array:", action.payload);
          state.staff = [];
        }
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.selectedStaff = action.payload;
      })

      .addCase(createSalaryPayment.fulfilled, (state, action) => {
        const payment = action.payload;
        const staffId = payment.staff;                    // assuming payment has staff ID
        if (staffId) {
          if (!state.salaryHistory[staffId]) {
            state.salaryHistory[staffId] = [];
          }
          state.salaryHistory[staffId].unshift(payment);  // newest first
        }
      })
      .addCase(updateStaffStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.staff.findIndex(s => s.id === updated.id);
        if (index !== -1) state.staff[index] = updated;
        if (state.selectedStaff?.id === updated.id) state.selectedStaff = updated;
      });
  },
});

export const { setSelectedStaff, clearSalaryHistory, setStaffFilter, resetStaffFilters } = staffSlice.actions;
export default staffSlice.reducer;