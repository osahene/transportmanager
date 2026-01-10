import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Customer, CustomerAddress } from "../../types/customer";
import { api } from "../services/api";
import axios from "axios";
interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: "active" | "suspended" | "inactive" | "all";
    loyaltyTier: "bronze" | "silver" | "gold" | "platinum" | "all";
    searchTerm: string;
    minBookings: number;
    dateRange: { start: string; end: string };
  };
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    suspendedCustomers: number;
    totalRevenue: number;
    averageSpending: number;
  };
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  filters: {
    status: "all",
    loyaltyTier: "all",
    searchTerm: "",
    minBookings: 0,
    dateRange: {
      start: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  },
  stats: {
    totalCustomers: 0,
    activeCustomers: 0,
    suspendedCustomers: 0,
    totalRevenue: 0,
    averageSpending: 0,
  },
};

// Async Thunks
export const fetchCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (params?: {
    status?: Customer["status"];
    loyaltyTier?: Customer["loyaltyTier"];
    search?: string;
    minBookings?: number;
  }) => {
    const response = await api.get("/customers", { params });
    return response.data;
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchById",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/${customerId}`);
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

export const createCustomer = createAsyncThunk(
  "customers/create",
  async (
    customerData: Omit<
      Customer,
      "id" | "createdAt" | "totalSpent" | "totalBookings"
    >,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/customers", customerData);
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

export const updateCustomer = createAsyncThunk(
  "customers/update",
  async (
    { customerId, updates }: { customerId: string; updates: Partial<Customer> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/customers/${customerId}`, updates);
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

export const suspendCustomer = createAsyncThunk(
  "customers/suspend",
  async (
    { customerId, reason }: { customerId: string; reason: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/customers/${customerId}/suspend`, {
        reason,
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

export const activateCustomer = createAsyncThunk(
  "customers/activate",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/customers/${customerId}/activate`);
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

export const checkCustomerEligibility = createAsyncThunk(
  "customers/checkEligibility",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/${customerId}/eligibility`);
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

export const updateCustomerStats = createAsyncThunk(
  "customers/updateStats",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/${customerId}/stats`);
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

export const fetchCustomerBookings = createAsyncThunk(
  "customers/fetchBookings",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/${customerId}/bookings`);
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

export const sendBulkCommunication = createAsyncThunk(
  "customers/sendBulkCommunication",
  async (
    {
      customerIds,
      message,
      type,
      subject,
    }: {
      customerIds: string[];
      message: string;
      type: "email" | "sms";
      subject?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/customers/communication/bulk", {
        customerIds,
        message,
        type,
        subject,
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

export const fetchCustomerFinancials = createAsyncThunk(
  "customers/fetchFinancials",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/${customerId}/financials`);
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

export const generateCustomerReport = createAsyncThunk(
  "customers/generateReport",
  async (
    {
      customerId,
      reportType,
      startDate,
      endDate,
    }: {
      customerId: string;
      reportType: "bookings" | "payments" | "all";
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/customers/${customerId}/reports/${reportType}`,
        {
          params: { startDate, endDate },
        }
      );
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

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(
        (customer) => customer.id === action.payload.id
      );
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filters.searchTerm = "";
    },
    sendBulkMessage: (
      state,
      action: PayloadAction<{
        customerIds: string[];
        message: string;
        type: "email" | "sms";
      }>
    ) => {
      // This would typically call an API
      console.log(
        `Sending ${action.payload.type} to customers:`,
        action.payload.customerIds
      );
      console.log("Message:", action.payload.message);
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<CustomersState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.searchTerm = action.payload;
    },
    updateLoyaltyTier: (
      state,
      action: PayloadAction<{
        customerId: string;
        loyaltyTier: Customer["loyaltyTier"];
      }>
    ) => {
      const customer = state.customers.find(
        (c) => c.id === action.payload.customerId
      );
      if (customer) {
        customer.loyaltyTier = action.payload.loyaltyTier;
      }
      if (state.selectedCustomer?.id === action.payload.customerId) {
        state.selectedCustomer.loyaltyTier = action.payload.loyaltyTier;
      }
    },
    addCustomerNote: (
      state,
      action: PayloadAction<{ customerId: string; note: string }>
    ) => {
      const customer = state.customers.find(
        (c) => c.id === action.payload.customerId
      );
      if (customer) {
        if (!customer.notes) customer.notes = [];
        customer.notes.push({
          id: `note-${Date.now()}`,
          content: action.payload.note,
          createdAt: new Date().toISOString(),
          createdBy: "admin", // This should come from auth context
        });
      }
    },
    updateCustomerAddress: (
      state,
      action: PayloadAction<{ customerId: string; address: CustomerAddress }>
    ) => {
      const customer = state.customers.find(
        (c) => c.id === action.payload.customerId
      );
      if (customer) {
        customer.address = action.payload.address;
      }
      if (state.selectedCustomer?.id === action.payload.customerId) {
        state.selectedCustomer.address = action.payload.address;
      }
    },
    updateGuarantor: (
      state,
      action: PayloadAction<{
        customerId: string;
        guarantor: Customer["guarantor"];
      }>
    ) => {
      const customer = state.customers.find(
        (c) => c.id === action.payload.customerId
      );
      if (customer) customer.guarantor = action.payload.guarantor;
      if (state.selectedCustomer?.id === action.payload.customerId) {
        state.selectedCustomer.guarantor = action.payload.guarantor;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers;
        state.stats = action.payload.stats;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch customers";
      })
      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;

        // Update customer in list if exists
        const index = state.customers.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch customer";
      })
      // Create customer
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload);
        state.stats.totalCustomers += 1;
        state.stats.activeCustomers += 1;
      })
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      // Suspend customer
      .addCase(suspendCustomer.fulfilled, (state, action) => {
        const customer = state.customers.find(
          (c) => c.id === action.payload.id
        );
        if (customer) customer.status = "suspended";
        if (
          state.selectedCustomer &&
          state.selectedCustomer.id === action.payload.id
        ) {
          state.selectedCustomer.status = "suspended";
        }
        state.stats.activeCustomers -= 1;
        state.stats.suspendedCustomers += 1;
      })
      // Activate customer
      .addCase(activateCustomer.fulfilled, (state, action) => {
        const customer = state.customers.find(
          (c) => c.id === action.payload.id
        );
        if (customer) {
          customer.status = "active";
        }
        if (
          state.selectedCustomer &&
          state.selectedCustomer.id === action.payload.id
        ) {
          state.selectedCustomer.status = "active";
        }
        state.stats.activeCustomers += 1;
        state.stats.suspendedCustomers -= 1;
      })
      // Update customer stats
      .addCase(updateCustomerStats.fulfilled, (state, action) => {
        const customer = state.customers.find(
          (c) => c.id === action.payload.id
        );
        if (customer) {
          customer.totalSpent = action.payload.totalSpent;
          customer.totalBookings = action.payload.totalBookings;
          customer.loyaltyTier = action.payload.loyaltyTier;
        }
        if (
          state.selectedCustomer &&
          state.selectedCustomer.id === action.payload.id
        ) {
          state.selectedCustomer.totalSpent = action.payload.totalSpent;
          state.selectedCustomer.totalBookings = action.payload.totalBookings;
          state.selectedCustomer.loyaltyTier = action.payload.loyaltyTier;
        }
      });
  },
});

export const {
  setSelectedCustomer,
  setFilters,
  clearFilters,
  addCustomer,

  setSearchTerm,
  updateLoyaltyTier,
  addCustomerNote,
  updateCustomerAddress,
  updateGuarantor,
} = customersSlice.actions;

export default customersSlice.reducer;
