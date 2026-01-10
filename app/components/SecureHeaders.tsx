"use client";

import { useEffect } from "react";
import CryptoJS from "crypto-js";

export function SecureHeaders() {
  useEffect(() => {
    // Generate CSRF token
    const csrfToken = CryptoJS.lib.WordArray.random(32).toString();
    localStorage.setItem("csrf-token", csrfToken);

    // Set secure cookies
    document.cookie = `csrf-token=${csrfToken}; Secure; SameSite=Strict; HttpOnly`;
  }, []);

  return null;
}
