import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import {encryptTransform} from "redux-persist-transform-encrypt";
import storageSession from "redux-persist/lib/storage/session";
import uIReducer from "../lib/slices/uiSlice";
import carReducer from "../lib/slices/carsSlice";
import bookingsReducer from "../lib/slices/bookingsSlice";
import customersReducer from "../lib/slices/customersSlice";
import financeReducer from "./slices/financialsSlice";
import maintenanceReducer from "./slices/maintenanceSlice";
import insuranceReducer from "./slices/insuranceSlice";
import StaffReducer from "../lib/slices/staffSlice";

const encryptor = encryptTransform({
  secretKey: process.env.NEXT_PUBLIC_PERSIST_KEY || "tmp-key", // see note below
  onError: function (err: any) {
    console.error("persist encrypt error", err);
  },
});


const rootReducer = combineReducers({
  ui: uIReducer,
  car: carReducer,
  bookings: bookingsReducer,
  customers: customersReducer,
  finance: financeReducer,
  maintenance: maintenanceReducer,
  insurance: insuranceReducer,
  staff: StaffReducer,
});

const persistConfig = {
  key: "root",
  storage: storageSession,
  transforms: [encryptor],
  whitelist: ["car", "customers", "staff", "insurance", "bookings"], // only these slices will be persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
