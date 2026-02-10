import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Car, CarStatus, EventPayload } from "../../types/cars";
import apiService from "../services/APIPath";

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
  Cars: [
    {
      id: "1",
      make: "Benz",
      model: "C230",
      year: 2010,
      licensePlate: "GT-2023-19",
      vin: "grrrr",
      color: "red",
      dailyRate: 180,
      status: "available",
      stats: {
        totalBookings: 50,
        totalRevenue: 1000,
      },
      features: {
        airConditioning: true,
        bluetooth: true,
        gps: false,
        backupCamera: true,
        wifi: true,
        navigation: true,
        premiumAudio: true,
      },
      specifications: {
        fuelType: "diesel",
        transmission: "true",
        seatingCapacity: 5,
        fuelCapacity: 150,
        engineType: "automatic",
      },
      createdAt: "10/12/2026",
      updatedAt: "12/12/2026",
    },
  ],
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
export const fetchCars = createAsyncThunk("Cars/fetchAll", async () => {
  const response = await apiService.getCars();
  return response.data;
});

export const fetchCarById = createAsyncThunk(
  "cars/fetchById",
  async (carId: string) => {
    const response = await apiService.getCarById(carId);
    return response.data;
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
    builder
      .addCase(fetchCars.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.loading = false;
        state.Cars = action.payload;
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch Cars";
      })
      .addCase(fetchCarById.fulfilled, (state, action) => {
        state.selectedCar = action.payload;
      });
  },
});

export const { setSelectedCar, setFilters, clearFilters } = CarsSlice.actions;
export default CarsSlice.reducer;
