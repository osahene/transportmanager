import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    "name": "YOS Car Rentals",
    "short_name": "YOS Cars",
    "description": "Manage car rentals offline",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#1e40af",
    "icons": [
      {
        "src": "/icons/icon-192x192.svg",
        "sizes": "192x192",
        "type": 'image/svg+xml',
      },
      {
        "src": "/icons/icon-512x512.svg",
        "sizes": "512x512",
        "type": 'image/svg+xml',
      },
    ],
  }
}