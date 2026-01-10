import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import uIReducer from "../lib/slices/uiSlice";
import carReducer from "../lib/slices/carsSlice";
import bookingsReducer from "../lib/slices/bookingsSlice";
import customersReducer from "../lib/slices/customersSlice";
import financeReducer from "./slices/financialsSlice";
import maintenanceReducer from "./slices/maintenanceSlice";
import insuranceReducer from "./slices/insuranceSlice";
import StaffReducer from "../lib/slices/staffSlice";

export const store = configureStore({
  reducer: {
    ui: uIReducer,
    car: carReducer,
    bookings: bookingsReducer,
    customers: customersReducer,
    finance: financeReducer,
    maintenance: maintenanceReducer,
    insurance: insuranceReducer,
    staff: StaffReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
