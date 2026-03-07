import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import {encryptTransform} from "redux-persist-transform-encrypt";
import { offlineStorage } from "./storage";
import uIReducer from "../lib/slices/uiSlice";
import bookingsReducer from "../lib/slices/bookingsSlice";
import offlineMutationReducer from "./slices/offlineMutationSlice";

const encryptor = encryptTransform({
  secretKey: process.env.NEXT_PUBLIC_PERSIST_KEY || "tmp-key", // see note below
  onError: function (err: any) {
    console.error("persist encrypt error", err);
  },
});


const rootReducer = combineReducers({
  ui: uIReducer,
  bookings: bookingsReducer,
  offlineMutations: offlineMutationReducer,
});

const persistConfig = {
  key: "root",
  storage: offlineStorage,
  transforms: [encryptor],
  whitelist: ["offlineMutations", "bookings"], 
  // whitelist: []
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
