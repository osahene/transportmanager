import { Customer } from "./customer";
import { Car } from "./cars";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type PaymentMethod = "cash" | "mobile_money" | "pay_in_slip";

export interface PayInSlipDetails {
  bankName: string;
  branch: string;
  payeeName: string;
  amount: number;
  paymentDate: string;
  referenceNumber: string;
  slipNumber: string;
}

export interface MobileMoneyDetails {
  transactionId: string;
  provider: string;
  phoneNumber: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  role: string;
  driverLicenseId?: string;
  driverLicenseClass?: string;
  driverLicenseIssueDate?: string;
  driverLicenseExpiryDate?: string;
}

// Main Booking interface for database/state
export interface Booking {
  id: string;
  carId: string;
  customerId: Customer["id"];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerGPSAddress: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorEmail?: string;
  guarantorGPSAddress?: string;
  driverName?: string;
  selfDrive: boolean;
  startDate: string;
  endDate: string;
  currentMileage: string;
  lastMileage?: string;
  status: BookingStatus;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod; // Made required
  payInSlipDetails?: PayInSlipDetails;
  mobileMoneyPayment?: MobileMoneyDetails;

  // Payment details
  paymentReference?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;

  // Locations
  pickupLocation: string;
  dropoffLocation: string;

  // Additional services
  hasDriver: string; // Changed from string to boolean
  driverId?: string;
  insuranceCoverage?: boolean;

  // Driver details for self-drive
  driverLicenseId?: string;
  driverLicenseClass?: string;
  driverLicenseIssueDate?: string;
  driverLicenseExpiryDate?: string;

  // Timestamps
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
}

// New interface for Booking Summary (used in confirmation modal)
export interface BookingSummary {
  customer: Customer | null;
  car: Car | null;
  driver: Driver | null;
  dates: {
    start: string;
    end: string;
  };
  selfDrive: boolean;
  duration: number;
  totalAmount: number;
  pickupLocation: string;
  dropoffLocation: string;
  paymentMethod: PaymentMethod;
  specialRequests?: string;

  // Self-drive details
  driverLicenseId?: string;
  driverLicenseClass?: string;
  driverLicenseIssueDate?: string;
  driverLicenseExpiryDate?: string;

  // Payment data
  paymentData?: {
    payInSlipDetails?: PayInSlipDetails;
    mobileMoneyDetails?: MobileMoneyDetails;
  };
}
