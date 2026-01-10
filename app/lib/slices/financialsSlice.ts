import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FinancialTransaction, DailySummary } from "../../types/finance";
import { api } from "../services/api";
import axios from "axios";

interface FinanceState {
  transactions: FinancialTransaction[];
  dailySummaries: DailySummary[];
  selectedPeriod: { start: string; end: string };
  loading: boolean;
  error: string | null;
  stats: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    outstandingPayments: number;
  };
}

const initialState: FinanceState = {
  transactions: [],
  dailySummaries: [],
  selectedPeriod: {
    start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  },
  loading: false,
  error: null,
  stats: {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstandingPayments: 0,
  },
};

export const recordTransaction = createAsyncThunk(
  "finance/recordTransaction",
  async (
    transaction: Omit<FinancialTransaction, "id" | "date">,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/transactions", transaction);
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

export const fetchFinancialStats = createAsyncThunk(
  "finance/fetchStats",
  async (period: { start: string; end: string }) => {
    const response = await api.get("/finance/stats", { params: period });
    return response.data;
  }
);

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    clearTransactions: (state) => {
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinancialStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(recordTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      });
  },
});

export const { setSelectedPeriod, clearTransactions } = financeSlice.actions;
export default financeSlice.reducer;
