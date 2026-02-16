import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Customer, CustomerAddress } from "../../types/customer";
import { snakeToCamel } from "../snakeToCamel";
import apiService from "../services/APIPath";

const getErrorMessage = (error: any) => {
  return error.response?.data?.message || error.message || 'An error occurred';
};


export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCustomers();
      const customers = response.data.map((cust: any) => snakeToCamel(cust));
      return customers as Customer[];
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);


export const fetchCustomerBookingsWithGuarantor = createAsyncThunk(
  'customers/fetchBookingsWithGuarantor',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getCustomerBookingsWithGuarantor(customerId);
      return { customerId, bookings: response.data };
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);


export const sendBulkSMS = createAsyncThunk(
  'customers/sendBulkSMS',
  async ({ customerIds, message }: { customerIds: string[]; message: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.sendBulkSMS(customerIds, message);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Thunk for single SMS
export const sendSingleSMS = createAsyncThunk(
  'customers/sendSingleSMS',
  async ({ customerId, message }: { customerId: string; message: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.sendSingleSMS(customerId, message);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

interface CustomersState {
  customers: Customer[];
  customerBookings: Record<string, any[]>
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
  customerBookings: {},
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
    totalCustomers: 3,
    activeCustomers: 1,
    suspendedCustomers: 1,
    totalRevenue: 28200,
    averageSpending: 9400,
  },
};


const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCustomerBookings: (state, action: PayloadAction<{ customerId: string; bookings: any[] }>) => {
      state.customerBookings[action.payload.customerId] = action.payload.bookings;
    },
    clearCustomerBookings: (state) => {
      state.customerBookings = {};
    },
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
      action.payload.customerIds,
        action.payload.message

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
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Bookings with Guarantor
      .addCase(fetchCustomerBookingsWithGuarantor.fulfilled, (state, action) => {
        state.customerBookings[action.payload.customerId] = action.payload.bookings;
      })
      .addCase(fetchCustomerBookingsWithGuarantor.rejected, (state, action) => {
        console.error('Failed to fetch bookings', action.payload);
      });
  },
});

export const {
  setSelectedCustomer,
  setFilters,
  clearFilters,
  addCustomer,
  updateCustomer,
  resetFilters,
  setCustomerBookings,
  clearCustomerBookings,
  sendBulkMessage,
  setSearchTerm,
  updateLoyaltyTier,
  addCustomerNote,
  updateCustomerAddress,
  updateGuarantor,
} = customersSlice.actions;

export default customersSlice.reducer;
