'use client';

import { useState, useEffect, useCallback } from "react";
import apiService from "./services/APIPath";

const CHECK_INTERVAL = 30000;

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  const checkConnectivity = useCallback(async () => {
    try {
      const response = await apiService.healthCheck();
      setIsOnline(response.status === 200);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkConnectivity();

    const handleOnline = () => checkConnectivity();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(checkConnectivity, CHECK_INTERVAL);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkConnectivity]);

  return isOnline;
}