import { format } from 'date-fns';

export interface ReceiptData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerGPSAddress: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorEmail?: string;
  guarantorGPSAddress?: string;
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
    customerGPSAddress: customer.gpsAddress || 'N/A',

    guarantorName: guarantor ? `${guarantor.firstName} ${guarantor.lastName}` : 'N/A',
    guarantorPhone: guarantor?.phone || 'N/A',
    guarantorEmail: guarantor?.email || 'N/A',
    guarantorGPSAddress: guarantor?.gpsAddress || 'N/A',

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
    date: new Date(),
  };
}