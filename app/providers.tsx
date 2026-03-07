"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { store, persistor } from "./lib/store";
import OfflineSync from "./components/offlineSync";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes – data is fresh for 5 min
      gcTime: 1000 * 60 * 60 * 24, // 24 hours – keep unused data in cache
      refetchOnWindowFocus: false, // adjust as needed
      retry: 1,
    },
  },
});

// Create a persister (uses localStorage)
const localStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "YOS_QUERY_CACHE",
});

// Persist the query client
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours – same as gcTime
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <OfflineSync />
          {children}
          {/* Optional: add React Query DevTools */}
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}