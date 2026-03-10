import { Customer } from "./customer";
import { Car } from "./cars";

export type BookingStatus =
  | "reserved"
  | "rented"
  | "completed"
  | "cancelled"
  | "extended_booking";
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
  CarId: string;
  customerId: Customer["id"];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerGPSAddress: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorEmail?: string;
  guarantorRelationship?: string;
  guarantorGPSAddress?: string;
  guarantorAddressCity?: string;
  guarantorAddressRegion?: string;
  guarantorAddressCountry?: string;
  driverName?: string;
  driverPhone?: string;
  selfDrive: boolean;
  startDate: string;
  endDate: string;
  currentMileage?: string;
  lastMileage?: string;
  status: BookingStatus;
  totalAmount: number;
  dailyRate?: number;     
  discount?: number; 
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
  hasDriver?: string; // Changed from string to boolean
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
  selfDrive: string;
  duration: number;
  totalAmount: number;
  dailyRate: number;
  discount: number;
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



import { format } from 'date-fns';

export interface ReceiptData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddressCity: string;
  customerGPSAddress: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorEmail?: string;
  guarantorGPSAddress?: string;
  guarantorAddressCity?: string;
  pickupLocation: string;
  dropoffLocation: string;
  selfDrive: boolean;
  driverName: string;
  driverPhone: string;
  driverLicenseId?: string;
  driverLicenseClass?: string;
  driverLicenseIssueDate?: string;
  driverLicenseExpiryDate?: string;
  numberOfDays: number;
  dailyRate: number;
  discount: number;
  carDetails: string;
  bookingDates: string;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  date: Date;
}

export function mapDetailedBookingToReceiptData(detailedBooking: any): ReceiptData {
  const customer = detailedBooking.customer || {};
  const guarantor = detailedBooking.guarantor;
  const car = detailedBooking.car || {};
  const driver = detailedBooking.driver;

  const start = new Date(detailedBooking.startDate);
  const end = new Date(detailedBooking.endDate);
  const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return {
    bookingId: detailedBooking.id,
    customerName: customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A',
    customerPhone: customer.phone || 'N/A',
    customerEmail: customer.email || 'N/A',
    customerAddressCity: customer.addressCity || 'N/A',
    customerGPSAddress: customer.gpsAddress || 'N/A',

    guarantorName: guarantor ? `${guarantor.firstName} ${guarantor.lastName}` : 'N/A',
    guarantorPhone: guarantor?.phone || 'N/A',
    guarantorEmail: guarantor?.email || 'N/A',
    guarantorGPSAddress: guarantor?.gpsAddress || 'N/A',
    guarantorAddressCity: guarantor?.addressCity || 'N/A',

    pickupLocation: detailedBooking.pickupLocation || 'N/A',
    dropoffLocation: detailedBooking.dropoffLocation || 'N/A',
    selfDrive: detailedBooking.isSelfDrive || false,
    driverName: driver ? `${driver.firstName} ${driver.lastName}` : (detailedBooking.isSelfDrive ? 'Self Drive' : 'N/A'),
    driverPhone: driver?.phone || 'N/A',
    driverLicenseId: detailedBooking.driverLicenseId || 'N/A',
    driverLicenseClass: detailedBooking.driverLicenseClass || 'N/A',
    driverLicenseIssueDate: detailedBooking.driverLicenseIssueDate || 'N/A',
    driverLicenseExpiryDate: detailedBooking.driverLicenseExpiryDate || 'N/A',

    numberOfDays,
    dailyRate: detailedBooking.dailyRate || 0,
    discount: detailedBooking.discount || 0,
    carDetails: `${car.make || ''} ${car.model || ''} (${car.licensePlate || 'N/A'})`.trim(),
    bookingDates: `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`,
    totalAmount: detailedBooking.totalAmount || 0,
    paymentMethod: detailedBooking.paymentMethod || 'N/A',
    transactionId: `TXN-${detailedBooking.id.slice(0, 8).toUpperCase()}`,
    date: detailedBooking.createdAt,
  };
}