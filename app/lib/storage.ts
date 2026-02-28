// lib/storage.ts
import localForage from 'localforage';

export const offlineStorage = localForage.createInstance({
  name: 'YOSCarRentals',
  storeName: 'reduxPersist',
});