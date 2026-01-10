export type CarStatus = "available" | "rented" | "maintenance" | "retired";

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  dailyRate: number;
  status: CarStatus;
  stats: Stats;
  features: CarFeatures;
  specifications: CarSpecifications;
  createdAt: string;
  updatedAt: string;
}

export interface CarFeatures {
  airConditioning: boolean;
  bluetooth: boolean;
  gps: boolean;
  backupCamera: boolean;
  wifi: boolean;
  navigation?: boolean;
  premiumAudio?: boolean;
  voiceControl?: boolean;
  sunroof?: boolean;
  leatherSeats?: boolean;
  parkingSensors?: boolean;
  // ... other features
}

export interface CarSpecifications {
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  fuelCapacity: number;
  engineType: string;
}

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  lastBookingDate?: string;
  nextAvailableDate?: string;
  maintenanceDueDate?: string;
}

export type EventPayload = {
  type:
    | "maintenance"
    | "revenue"
    | "insurance"
    | "accident"
    | "registration"
    | "inspection"
    | "other";
  title: string;
  description: string;
  date: string;
  amount: number;
  garage?: string;
  returnDate?: string;
  provider?: string;
  policyNumber?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
  source?: string;
};
