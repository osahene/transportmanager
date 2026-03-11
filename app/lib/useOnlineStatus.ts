'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

const CHECK_INTERVAL = 30000; // 30 seconds
const CHECK_TIMEOUT = 5000;    // 5 seconds
const PING_URL = '/ping.txt';  // Relative URL – same origin

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), CHECK_TIMEOUT);

      // Add a cache-busting timestamp to avoid cached responses
      const url = `${PING_URL}?t=${Date.now()}`;

      const response = await fetch(url, {
        method: 'HEAD',        // We only need headers, not the body
        cache: 'no-cache',     // Force revalidation
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