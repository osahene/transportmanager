import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MaintenanceRecord, MaintenanceStatus } from "../../types/maintenance";
import { api } from "../services/api";
import axios from "axios";
import { RootState } from "../store";
import { updateCarStatus } from "../slices/carsSlice";

interface MaintenanceState {
  records: MaintenanceRecord[];
  selectedRecord: MaintenanceRecord | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: MaintenanceStatus | "all";
    carId?: string;
    dateRange: { start: string; end: string };
  };
}

const initialState: MaintenanceState = {
  records: [],
  selectedRecord: null,
  loading: false,
  error: null,
  filters: {
    status: "all",
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1))
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  },
};

// Async thunks
export const fetchMaintenanceRecords = createAsyncThunk(
  "maintenance/fetchAll",
  async (params?: { carId?: string; status?: MaintenanceStatus }) => {
    const response = await api.get("/maintenance", { params });
    return response.data;
  }
);

export const createMaintenanceRecord = createAsyncThunk(
  "maintenance/create",
  async (
    recordData: Omit<MaintenanceRecord, "id" | "createdAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/maintenance", recordData);
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

export const updateMaintenanceStatus = createAsyncThunk(
  "maintenance/updateStatus",
  async (
    {
      recordId,
      status,
      carId,
      estimatedEndDate,
      notes,
    }: {
      recordId: string;
      status: MaintenanceStatus;
      carId: string;
      estimatedEndDate?: string;
      notes?: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.patch(`/maintenance/${recordId}`, {
        status,
        estimatedEndDate,
        notes,
      });

      // If maintenance is completed, update car status
      if (status === "completed") {
        dispatch(checkAndupdateCarStatus(carId));
      }

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

export const completeMaintenance = createAsyncThunk(
  "maintenance/complete",
  async (
    {
      recordId,
      carId,
      actualEndDate,
    }: {
      recordId: string;
      carId: string;
      actualEndDate?: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.patch(`/maintenance/${recordId}/complete`, {
        actualEndDate,
      });

      // Update car status
      dispatch(checkAndupdateCarStatus(carId));

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

export const extendMaintenanceDeadline = createAsyncThunk(
  "maintenance/extendDeadline",
  async (
    {
      recordId,
      newEstimatedDate,
      reason,
    }: {
      recordId: string;
      newEstimatedDate: string;
      reason: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/maintenance/${recordId}/extend`, {
        estimatedEndDate: newEstimatedDate,
        notes: `Deadline extended to ${newEstimatedDate}. Reason: ${reason}`,
        status: "delayed" as MaintenanceStatus,
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

export const checkAndupdateCarStatus = createAsyncThunk(
  "maintenance/checkcarStatus",
  async (CarId: string, { dispatch, getState }) => {
    try {
      const state = getState() as RootState;
      const carRecords = state.maintenance.records.filter(
        (record) => record.vehicleId === CarId
      );

      const activeMaintenance = carRecords.some(
        (record) =>
          record.status === "in-progress" || record.status === "delayed"
      );

      if (activeMaintenance) {
        dispatch(updateCarStatus({ CarId, status: "maintenance" }));
      } else {
        // car is not in maintenance, check if it's available for booking
        const response = await api.get(`/cars/${CarId}/status`);
        dispatch(updateCarStatus({ CarId, status: response.data.status }));
      }
    } catch (error) {
      console.error("Failed to check car status:", error);
    }
  }
);

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    setSelectedRecord: (
      state,
      action: PayloadAction<MaintenanceRecord | null>
    ) => {
      state.selectedRecord = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<MaintenanceState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    addRecord: (state, action: PayloadAction<MaintenanceRecord>) => {
      state.records.unshift(action.payload);
    },
    updateRecord: (state, action: PayloadAction<MaintenanceRecord>) => {
      const index = state.records.findIndex(
        (record) => record.id === action.payload.id
      );
      if (index !== -1) {
        state.records[index] = action.payload;
      }
      if (state.selectedRecord?.id === action.payload.id) {
        state.selectedRecord = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchMaintenanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch maintenance records";
      })
      .addCase(createMaintenanceRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
      })
      .addCase(updateMaintenanceStatus.fulfilled, (state, action) => {
        const index = state.records.findIndex(
          (record) => record.id === action.payload.id
        );
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.selectedRecord?.id === action.payload.id) {
          state.selectedRecord = action.payload;
        }
      })
      .addCase(completeMaintenance.fulfilled, (state, action) => {
        const index = state.records.findIndex(
          (record) => record.id === action.payload.id
        );
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.selectedRecord?.id === action.payload.id) {
          state.selectedRecord = action.payload;
        }
      })
      .addCase(extendMaintenanceDeadline.fulfilled, (state, action) => {
        const index = state.records.findIndex(
          (record) => record.id === action.payload.id
        );
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.selectedRecord?.id === action.payload.id) {
          state.selectedRecord = action.payload;
        }
      });
  },
});

export const {
  setSelectedRecord,
  setFilters,
  clearFilters,
  addRecord,
  updateRecord,
} = maintenanceSlice.actions;

// Selectors
export const selectMaintenanceRecords = (state: RootState) =>
  state.maintenance.records;
export const selectActiveMaintenance = (state: RootState) =>
  state.maintenance.records.filter(
    (record) => record.status === "in-progress" || record.status === "delayed"
  );
export const selectMaintenanceBycarId = (carId: string) => (state: RootState) =>
  state.maintenance.records.filter((record) => record.vehicleId === carId);

export default maintenanceSlice.reducer;
