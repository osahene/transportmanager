"use client";

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./lib/store";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { ThemeProvider } from "next-themes";
// import ThemeInitializer from "./components/homepage/themeInitializer";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000, // 5 minutes
//       gcTime: 10 * 60 * 1000, // 10 minutes
//       retry: 1,
//     },
//   },
// });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <ThemeProvider
    //   attribute="class"
    //   defaultTheme="system"
    //   enableSystem
    //   disableTransitionOnChange
    // >
    //   <ThemeInitializer />
    <Provider store={store}>
      {/* <QueryClientProvider client={queryClient}> */}
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      {/* </QueryClientProvider> */}
    </Provider>
    // </ThemeProvider>
  );
}
