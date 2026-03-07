// components/OfflineSync.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/store";
import { removeMutation } from "@/app/lib/slices/offlineMutationSlice";
import { useOnlineStatus } from "../lib/useOnlineStatus";
import { useCreateBooking } from "../lib/hooks/useBookings";
// import other mutation hooks as needed

export default function OfflineSync() {
  const dispatch = useAppDispatch();
  const isOnline = useOnlineStatus();
  const mutations = useAppSelector((state) => state.offlineMutations);

  // Get mutation hooks (we need to call them conditionally, but hooks must be called at top level)
  const createBooking = useCreateBooking();
  // ... other mutations

  useEffect(() => {
    if (!isOnline || mutations.length === 0) return;

    const processMutations = async () => {
      for (const mutation of mutations) {
        try {
          switch (mutation.type) {
            case "createBooking":
              await createBooking.mutateAsync(mutation.payload);
              break;
            // add cases for other mutation types
            default:
              console.warn("Unknown mutation type", mutation.type);
          }
          dispatch(removeMutation(mutation.id));
        } catch (error) {
          console.error("Failed to sync mutation", mutation, error);
          // Optionally keep it for retry later, or mark as failed
        }
      }
    };

    processMutations();
  }, [isOnline, mutations, dispatch, createBooking]);

  return null;
}