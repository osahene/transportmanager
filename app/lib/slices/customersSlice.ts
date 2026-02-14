import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Customer, CustomerAddress } from "../../types/customer";
import apiService from "../services/APIPath";
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
  customers: [
    {
      id: "cust-001",
      firstName: "Kwame",
      lastName: "Mensah",
      email: "kwame.mensah@example.com",
      phone: "+233241234567",
      ghanaCardId: "GHA-123456789-0",
      driverLicenseId: "DL-AC-2023-001",
      occupation: "Software Engineer",
      gpsAddress: "GA-492-8831",
      address: {
        city: "Accra",
        region: "Greater Accra",
        country: "Ghana",
      },
      status: "active",
      loyaltyTier: "gold",
      totalSpent: 18500,
      totalBookings: 12,
      createdAt: "2024-03-15T10:30:00Z",
      lastBookingDate: "2025-01-05T14:20:00Z",
      notes: [
        {
          id: "note-001",
          content: "Very punctual and takes good care of vehicles.",
          createdAt: "2024-06-10T09:15:00Z",
          createdBy: "Admin",
        },
      ],
      guarantor: {
        id: "gua-001",
        firstName: "Yaw",
        lastName: "Mensah",
        phone: "+233209876543",
        email: "yaw.mensah@example.com",
        ghanaCardId: "GHA-987654321-1",
        occupation: "Civil Servant",
        gpsAddress: "GA-112-3321",
        relationship: "Brother",
        address: {
          city: "Accra",
          region: "Greater Accra",
          country: "Ghana",
        },
      },
      communicationPreferences: {
        email: true,
        sms: true,
        phone: false,
      },
    },

    {
      id: "cust-002",
      firstName: "Ama",
      lastName: "Boateng",
      email: "ama.boateng@example.com",
      phone: "+233551112223",
      ghanaCardId: "GHA-223344556-2",
      occupation: "Entrepreneur",
      gpsAddress: "AS-224-9902",
      address: {
        city: "Kumasi",
        region: "Ashanti",
        country: "Ghana",
      },
      status: "suspended",
      loyaltyTier: "silver",
      totalSpent: 7200,
      totalBookings: 5,
      createdAt: "2023-11-02T08:00:00Z",
      lastBookingDate: "2024-08-19T16:45:00Z",
      notes: [
        {
          id: "note-002",
          content: "Account suspended due to late payment.",
          createdAt: "2024-09-01T11:00:00Z",
          createdBy: "Finance Team",
        },
      ],
      guarantor: {
        id: "gua-002",
        firstName: "Kofi",
        lastName: "Boateng",
        phone: "+233508889900",
        ghanaCardId: "GHA-665544332-3",
        occupation: "Trader",
        gpsAddress: "AS-889-1133",
        relationship: "Husband",
        address: {
          city: "Kumasi",
          region: "Ashanti",
          country: "Ghana",
        },
      },
      communicationPreferences: {
        email: true,
        sms: false,
        phone: true,
      },
    },

    {
      id: "cust-003",
      firstName: "Daniel",
      lastName: "Owusu",
      email: "daniel.owusu@example.com",
      phone: "+233271234890",
      ghanaCardId: "GHA-998877665-4",
      occupation: "University Lecturer",
      gpsAddress: "CP-331-4410",
      address: {       
        city: "Cape Coast",
        region: "Central",
        country: "Ghana",
      },
      status: "active",
      loyaltyTier: "bronze",
      totalSpent: 2500,
      totalBookings: 2,
      createdAt: "2022-07-21T12:10:00Z",
      lastBookingDate: "2023-01-14T09:30:00Z",
      notes: [],
      guarantor: {
        id: "gua-003",
        firstName: "Joseph",
        lastName: "Owusu",
        phone: "+233241119988",
        ghanaCardId: "GHA-554433221-5",
        occupation: "Farmer",
        gpsAddress: "CP-220-5511",
        relationship: "Father",
        address: {
          city: "Cape Coast",
          region: "Central",
          country: "Ghana",
        },
      },
      communicationPreferences: {
        email: false,
        sms: true,
        phone: true,
      },
    },
  ],

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

// Async Thunks
// export const fetchCustomers = createAsyncThunk(
//   "customers/fetchAll",
//   async (params?: {
//     status?: Customer["status"];
//     loyaltyTier?: Customer["loyaltyTier"];
//     search?: string;
//     minBookings?: number;
//   }) => {
//     const response = await api.get("/customers", { params });
//     return response.data;
//   }
// );

// export const fetchCustomerById = createAsyncThunk(
//   "customers/fetchById",
//   async (customerId: string, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`/customers/${customerId}`);
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

// export const createCustomer = createAsyncThunk(
//   "customers/create",
//   async (
//     customerData: Omit<
//       Customer,
//       "id" | "createdAt" | "totalSpent" | "totalBookings"
//     >,
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await api.post("/customers", customerData);
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

// export const updateCustomer = createAsyncThunk(
//   "customers/update",
//   async (
//     { customerId, updates }: { customerId: string; updates: Partial<Customer> },
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await api.patch(`/customers/${customerId}`, updates);
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

// export const suspendCustomer = createAsyncThunk(
//   "customers/suspend",
//   async (
//     { customerId, reason }: { customerId: string; reason: string },
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await api.post(`/customers/${customerId}/suspend`, {
//         reason,
//       });
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

// export const activateCustomer = createAsyncThunk(
//   "customers/activate",
//   async (customerId: string, { rejectWithValue }) => {
//     try {
//       const response = await api.post(`/customers/${customerId}/activate`);
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

// export const checkCustomerEligibility = createAsyncThunk(
//   "customers/checkEligibility",
//   async (customerId: string, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`/customers/${customerId}/eligibility`);
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

// export const updateCustomerStats = createAsyncThunk(
//   "customers/updateStats",
//   async (customerId: string, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`/customers/${customerId}/stats`);
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

// export const fetchCustomerBookings = createAsyncThunk(
//   "customers/fetchBookings",
//   async (customerId: string, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`/customers/${customerId}/bookings`);
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

// export const sendBulkCommunication = createAsyncThunk(
//   "customers/sendBulkCommunication",
//   async (
//     {
//       customerIds,
//       message,
//       type,
//       subject,
//     }: {
//       customerIds: string[];
//       message: string;
//       type: "email" | "sms";
//       subject?: string;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await api.post("/customers/communication/bulk", {
//         customerIds,
//         message,
//         type,
//         subject,
//       });
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

// export const fetchCustomerFinancials = createAsyncThunk(
//   "customers/fetchFinancials",
//   async (customerId: string, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`/customers/${customerId}/financials`);
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

// export const generateCustomerReport = createAsyncThunk(
//   "customers/generateReport",
//   async (
//     {
//       customerId,
//       reportType,
//       startDate,
//       endDate,
//     }: {
//       customerId: string;
//       reportType: "bookings" | "payments" | "all";
//       startDate?: string;
//       endDate?: string;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await api.get(
//         `/customers/${customerId}/reports/${reportType}`,
//         {
//           params: { startDate, endDate },
//         }
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
      // .addCase(fetchCustomers.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchCustomers.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.customers = action.payload.customers;
      //   state.stats = action.payload.stats;
      // })
      // .addCase(fetchCustomers.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.error.message || "Failed to fetch customers";
      // })
      // // Fetch customer by ID
      // .addCase(fetchCustomerById.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchCustomerById.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.selectedCustomer = action.payload;

      //   // Update customer in list if exists
      //   const index = state.customers.findIndex(
      //     (c) => c.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.customers[index] = action.payload;
      //   }
      // })
      // .addCase(fetchCustomerById.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = (action.payload as string) || "Failed to fetch customer";
      // })
      // // Create customer
      // .addCase(createCustomer.fulfilled, (state, action) => {
      //   state.customers.unshift(action.payload);
      //   state.stats.totalCustomers += 1;
      //   state.stats.activeCustomers += 1;
      // })
      // // Update customer
      // .addCase(updateCustomer.fulfilled, (state, action) => {
      //   const index = state.customers.findIndex(
      //     (c) => c.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.customers[index] = action.payload;
      //   }
      //   if (state.selectedCustomer?.id === action.payload.id) {
      //     state.selectedCustomer = action.payload;
      //   }
      // })
      // // Suspend customer
      // .addCase(suspendCustomer.fulfilled, (state, action) => {
      //   const customer = state.customers.find(
      //     (c) => c.id === action.payload.id
      //   );
      //   if (customer) customer.status = "suspended";
      //   if (
      //     state.selectedCustomer &&
      //     state.selectedCustomer.id === action.payload.id
      //   ) {
      //     state.selectedCustomer.status = "suspended";
      //   }
      //   state.stats.activeCustomers -= 1;
      //   state.stats.suspendedCustomers += 1;
      // })
      // // Activate customer
      // .addCase(activateCustomer.fulfilled, (state, action) => {
      //   const customer = state.customers.find(
      //     (c) => c.id === action.payload.id
      //   );
      //   if (customer) {
      //     customer.status = "active";
      //   }
      //   if (
      //     state.selectedCustomer &&
      //     state.selectedCustomer.id === action.payload.id
      //   ) {
      //     state.selectedCustomer.status = "active";
      //   }
      //   state.stats.activeCustomers += 1;
      //   state.stats.suspendedCustomers -= 1;
      // })
      // // Update customer stats
      // .addCase(updateCustomerStats.fulfilled, (state, action) => {
      //   const customer = state.customers.find(
      //     (c) => c.id === action.payload.id
      //   );
      //   if (customer) {
      //     customer.totalSpent = action.payload.totalSpent;
      //     customer.totalBookings = action.payload.totalBookings;
      //     customer.loyaltyTier = action.payload.loyaltyTier;
      //   }
      //   if (
      //     state.selectedCustomer &&
      //     state.selectedCustomer.id === action.payload.id
      //   ) {
      //     state.selectedCustomer.totalSpent = action.payload.totalSpent;
      //     state.selectedCustomer.totalBookings = action.payload.totalBookings;
      //     state.selectedCustomer.loyaltyTier = action.payload.loyaltyTier;
      //   }
      // });
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
