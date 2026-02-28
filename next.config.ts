import type { NextConfig } from "next";

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // enable only in production
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https?.*/, // cache all same‑origin and CDN assets
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost" }], // Add your image domains
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
  // async headers() {
    //   return [
      //     {
        //       source: '/:path*',
        //       headers: [
          //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff',
  //         },
  //         {
    //           key: 'X-Frame-Options',
  //           value: 'DENY',
  //         },
  //         {
    //           key: 'X-XSS-Protection',
  //           value: '1; mode=block',
  //         },
  //       ],
  //     },
  //   ];
  // },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;

module.exports = withPWA(nextConfig);