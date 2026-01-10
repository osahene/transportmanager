import { Booking } from "../../types/booking";

export class BookingService {
  static calculateTotalAmount(
    dailyRate: number,
    startDate: string,
    endDate: string,
    hasDriver: boolean = false,
    insuranceCoverage: boolean = false
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    let total = dailyRate * days;

    if (hasDriver) {
      total += 50 * days; // Driver fee
    }

    if (insuranceCoverage) {
      total += total * 0.15; // 15% insurance fee
    }

    return total;
  }

  static calculateRefundAmount(
    totalAmount: number,
    cancellationDate: string,
    startDate: string
  ): number {
    const cancellation = new Date(cancellationDate);
    const start = new Date(startDate);
    const daysUntilStart = Math.ceil(
      (start.getTime() - cancellation.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilStart > 7) {
      return totalAmount * 0.9; // 90% refund if cancelled more than 7 days before
    } else if (daysUntilStart > 3) {
      return totalAmount * 0.5; // 50% refund if 3-7 days before
    } else if (daysUntilStart > 1) {
      return totalAmount * 0.25; // 25% refund if 1-3 days before
    }
    return 0; // No refund within 24 hours
  }

  static isBookingValid(booking: Partial<Booking>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!booking.carId) errors.push("Car is required");
    if (!booking.customerId) errors.push("Customer is required");
    if (!booking.startDate) errors.push("Start date is required");
    if (!booking.endDate) errors.push("End date is required");

    if (booking.startDate && booking.endDate) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);

      if (end <= start) errors.push("End date must be after start date");
      if (start < new Date()) errors.push("Start date cannot be in the past");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
