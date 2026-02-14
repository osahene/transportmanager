import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Car, CarStatus, EventPayload } from "../../types/cars";
import apiService from "../services/APIPath";

const getErrorMessage = (error: any) => {
  return error.response?.data?.message || error.message || "An error occurred";
};


export interface CarsState {
  Cars: Car[];
  selectedCar: Car | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: CarStatus | "all";
    make: string;
    minRate: number;
    maxRate: number;
  };
}

const initialState: CarsState = {
  Cars: [],
  selectedCar: null,
  loading: false,
  error: null,
  filters: {
    status: "all",
    make: "",
    minRate: 0,
    maxRate: 1000,
  },
};

// Async thunks for API calls
export const fetchCars = createAsyncThunk(
  "cars/fetchCars",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCars();
      console.log("Fetch Cars Response:", response);
      return response.data; // Adjust based on your actual API shape
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchCarById = createAsyncThunk(
  "cars/fetchCarById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getCarById(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCarStatus = createAsyncThunk(
  "Cars/updateStatus",
  async ({ CarId, status }: { CarId: string; status: CarStatus }) => {
    const response = await apiService.updateCarStatus(CarId, status);
    return response.data;
  }
);
export const updateCarStatusWithEventPayload = createAsyncThunk(
  "Cars/updateStatus",
  async ({ CarId, payload }: { CarId: string; payload: EventPayload }) => {
    const response = await apiService.updateCarStatusWithEventPayload(CarId, payload);
    return response.data;
  }
);

const CarsSlice = createSlice({
  name: "Cars",
  initialState,
  reducers: {
    setSelectedCar: (state, action) => {
      state.selectedCar = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    // Fetch Cars
    builder.addCase(fetchCars.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCars.fulfilled, (state, action) => {
      state.loading = false;
      state.Cars = action.payload.results || [];
    });
    builder.addCase(fetchCars.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Car by ID
    builder.addCase(fetchCarById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCarById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedCar = action.payload;
    });
    builder.addCase(fetchCarById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(updateCarStatusWithEventPayload.fulfilled, (state, action) => {
      // action.payload should be the updated car object from backend
      const updatedCar = action.payload;
      const index = state.Cars.findIndex(c => c.id === updatedCar.id);
      if (index !== -1) {
        state.Cars[index] = updatedCar;
      }
      if (state.selectedCar?.id === updatedCar.id) {
        state.selectedCar = updatedCar;
      }
      // Optionally clear loading/error
    });
  },
});

export const { setSelectedCar, setFilters, clearFilters } = CarsSlice.actions;
export default CarsSlice.reducer;
