import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QueuedMutation {
  id: string; // unique ID for the mutation
  type: string; // e.g., "createBooking", "updateCarStatus"
  payload: any;
  timestamp: number;
}

const initialState: QueuedMutation[] = [];

const offlineMutationsSlice = createSlice({
  name: "offlineMutations",
  initialState,
  reducers: {
    addMutation: (state, action: PayloadAction<Omit<QueuedMutation, "id">>) => {
      state.push({
        ...action.payload,
        id: `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    },
    removeMutation: (state, action: PayloadAction<string>) => {
      return state.filter((m) => m.id !== action.payload);
    },
    clearMutations: () => [],
  },
});

export const { addMutation, removeMutation, clearMutations } = offlineMutationsSlice.actions;
export default offlineMutationsSlice.reducer;