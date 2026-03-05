// app/lib/useOnlineStatus.ts
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

const CHECK_INTERVAL = 30000; // 30 seconds
const CHECK_TIMEOUT = 5000;    // 5 seconds
const TEST_URL = '/favicon.ico'; // or 'https://www.google.com/favicon.ico' (CORS may apply)

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), CHECK_TIMEOUT);

      const response = await fetch(TEST_URL, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(id);
      setIsOnline(response.ok);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Listen to browser online/offline events (they still provide useful triggers)
    const handleOnline = () => checkConnectivity();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check
    const interval = setInterval(checkConnectivity, CHECK_INTERVAL);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [checkConnectivity]);

  return isOnline;
}