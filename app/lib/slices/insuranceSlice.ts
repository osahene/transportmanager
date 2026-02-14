import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { InsurancePolicy, InsuranceStatus } from "../../types/insurance";
import apiService from "../services/APIPath";
import { RootState } from "../store";
import axios from "axios";
import { updateCarStatus } from "./carsSlice";

interface InsuranceState {
  policies: InsurancePolicy[];
  selectedPolicy: InsurancePolicy | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: InsuranceStatus | "all";
    provider: string;
    expiryDate: { start: string; end: string };
  };
}

const initialState: InsuranceState = {
  policies: [],
  selectedPolicy: null,
  loading: false,
  error: null,
  filters: {
    status: "all",
    provider: "",
    expiryDate: {
      start: new Date().toISOString().split("T")[0],
      end: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
    },
  },
};

// Async thunks
// export const fetchInsurancePolicies = createAsyncThunk(
//   "insurance/fetchAll",
//   async (params?: { vehicleId?: string; status?: InsuranceStatus }) => {
//     const response = await apiService.get("/insurance", { params });
//     return response.data;
//   }
// );

// export const createInsurancePolicy = createAsyncThunk(
//   "insurance/create",
//   async (policyData: Omit<InsurancePolicy, "id">, { rejectWithValue }) => {
//     try {
//       const response = await apiService.post("/insurance", policyData);
//       return response.data;
//     } catch (error: unknown) {
//       if (axios.isAxiosError(error)) {
//         return rejectWithValue(
//           error.response?.data?.message || "Failed to create maintenance record"
//         );
//       }
//       return rejectWithValue("An unexpected error occurred");
//     }
//   }
// );

// export const updateInsurancePolicy = createAsyncThunk(
//   "insurance/update",
//   async (
//     {
//       policyId,
//       updates,
//     }: {
//       policyId: string;
//       updates: Partial<InsurancePolicy>;
//     },
//     { rejectWithValue, dispatch }
//   ) => {
//     try {
//       const response = await api.patch(`/insurance/${policyId}`, updates);

//       // If insurance is expired, update vehicle status
//       if (updates.status === "expired") {
//         const policy = response.data;
//         dispatch(checkVehicleInsuranceStatus(policy.vehicleId));
//       }

//       return response.data;
//     } catch (error: unknown) {
//       if (axios.isAxiosError(error)) {
//         return rejectWithValue(
//           error.response?.data?.message || "Failed to create maintenance record"
//         );
//       }
//       return rejectWithValue("An unexpected error occurred");
//     }
//   }
// );

// export const renewInsurancePolicy = createAsyncThunk(
//   "insurance/renew",
//   async (
//     {
//       policyId,
//       renewalData,
//     }: {
//       policyId: string;
//       renewalData: {
//         startDate: string;
//         endDate: string;
//         premium: number;
//       };
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await api.post(
//         `/insurance/${policyId}/renew`,
//         renewalData
//       );
//       return response.data;
//     } catch (error: unknown) {
//       if (axios.isAxiosError(error)) {
//         return rejectWithValue(
//           error.response?.data?.message || "Failed to create maintenance record"
//         );
//       }
//       return rejectWithValue("An unexpected error occurred");
//     }
//   }
// );

// export const checkVehicleInsuranceStatus = createAsyncThunk(
//   "insurance/checkVehicleStatus",
//   async (vehicleId: string, { dispatch, getState }) => {
//     try {
//       const state = getState() as RootState;
//       const vehiclePolicies = state.insurance.policies.filter(
//         (policy) => policy.vehicleId === vehicleId
//       );

//       const hasActiveInsurance = vehiclePolicies.some(
//         (policy) =>
//           policy.status === "active" && new Date(policy.endDate) >= new Date()
//       );

//       if (!hasActiveInsurance) {
//         dispatch(updateCarStatus({ CarId: vehicleId, status: "retired" }));
//       }
//     } catch (error) {
//       console.error("Failed to check insurance status:", error);
//     }
//   }
// );

// export const checkExpiringPolicies = createAsyncThunk(
//   "insurance/checkExpiring",
//   async (daysThreshold: number = 30) => {
//     const response = await api.get("/insurance/expiring", {
//       params: { days: daysThreshold },
//     });
//     return response.data;
//   }
// );

const insuranceSlice = createSlice({
  name: "insurance",
  initialState,
  reducers: {
    setSelectedPolicy: (
      state,
      action: PayloadAction<InsurancePolicy | null>
    ) => {
      state.selectedPolicy = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<InsuranceState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    addPolicy: (state, action: PayloadAction<InsurancePolicy>) => {
      state.policies.unshift(action.payload);
    },
    updatePolicy: (state, action: PayloadAction<InsurancePolicy>) => {
      const index = state.policies.findIndex(
        (policy) => policy.id === action.payload.id
      );
      if (index !== -1) {
        state.policies[index] = action.payload;
      }
      if (state.selectedPolicy?.id === action.payload.id) {
        state.selectedPolicy = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(fetchInsurancePolicies.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchInsurancePolicies.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.policies = action.payload;
      // })
      // .addCase(fetchInsurancePolicies.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error =
      //     action.error.message || "Failed to fetch insurance policies";
      // })
      // .addCase(createInsurancePolicy.fulfilled, (state, action) => {
      //   state.policies.unshift(action.payload);
      // })
      // .addCase(updateInsurancePolicy.fulfilled, (state, action) => {
      //   const index = state.policies.findIndex(
      //     (policy) => policy.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.policies[index] = action.payload;
      //   }
      //   if (state.selectedPolicy?.id === action.payload.id) {
      //     state.selectedPolicy = action.payload;
      //   }
      // })
      // .addCase(renewInsurancePolicy.fulfilled, (state, action) => {
      //   const index = state.policies.findIndex(
      //     (policy) => policy.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.policies[index] = action.payload;
      //   }
      //   if (state.selectedPolicy?.id === action.payload.id) {
      //     state.selectedPolicy = action.payload;
      //   }
      // })
      // .addCase(checkExpiringPolicies.fulfilled, (state, action) => {
      //   // Update policies that are expiring soon
      //   action.payload.forEach((expiringPolicy: InsurancePolicy) => {
      //     const index = state.policies.findIndex(
      //       (p) => p.id === expiringPolicy.id
      //     );
      //     if (index !== -1) {
      //       state.policies[index] = expiringPolicy;
      //     }
      //   });
      // });
  },
});

export const {
  setSelectedPolicy,
  setFilters,
  clearFilters,
  addPolicy,
  updatePolicy,
} = insuranceSlice.actions;

// Selectors
export const selectInsurancePolicies = (state: RootState) =>
  state.insurance.policies;
export const selectActivePolicies = (state: RootState) =>
  state.insurance.policies.filter((policy) => policy.status === "active");
export const selectExpiringPolicies = (state: RootState) =>
  state.insurance.policies.filter((policy) => {
    if (policy.status !== "active") return false;
    const endDate = new Date(policy.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30;
  });
export const selectInsuranceByVehicleId =
  (vehicleId: string) => (state: RootState) =>
    state.insurance.policies.filter((policy) => policy.vehicleId === vehicleId);

export default insuranceSlice.reducer;
