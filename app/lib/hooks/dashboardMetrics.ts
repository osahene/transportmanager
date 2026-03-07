import { Car } from '@/app/types/cars';
import { Booking } from '@/app/types/booking';
import { Customer } from '@/app/types/customer';
import { Staff } from '@/app/types/staff';

export interface DashboardMetrics {
  totalCars: number;
  totalCustomers: number;
  totalDrivers: number;
  currentMonthBookings: number;
  previousMonthBookings: number;
  monthlyBookings: number[];
  monthlyRevenue: number[];
  carStatusCounts: {
    available: number;
    rented: number;
    maintenance: number;
    insurance_expired: number;
    accident: number;
    retired: number;
  };
}

export function computeDashboardMetrics(
  cars: Car[],
  bookings: Booking[],
  customers: Customer[],
  staff: Staff[]
): DashboardMetrics {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const isBookingInMonth = (booking: Booking, month: number, year: number) => {
    const d = new Date(booking.startDate);
    return d.getMonth() === month && d.getFullYear() === year;
  };

  const currentMonthBookings = bookings.filter(b => isBookingInMonth(b, currentMonth, currentYear)).length;
  const previousMonthBookings = bookings.filter(b => isBookingInMonth(b, previousMonth, previousMonthYear)).length;

  const monthlyBookings = Array(12).fill(0).map((_, idx) => {
    return bookings.filter(b => {
      const d = new Date(b.startDate);
      return d.getMonth() === idx && d.getFullYear() === currentYear;
    }).length;
  });

  const monthlyRevenue = Array(12).fill(0).map((_, idx) => {
    return bookings
      .filter(b => {
        const d = new Date(b.startDate);
        return d.getMonth() === idx && d.getFullYear() === currentYear && b.status === 'completed';
      })
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  });

  const totalCustomers = customers.length;
  const totalDrivers = staff.filter(s => s.role?.toLowerCase() === 'driver').length;

  const carStatusCounts = {
    available: cars.filter(c => c.status === 'available').length,
    rented: cars.filter(c => c.status === 'rented').length,
    maintenance: cars.filter(c => c.status === 'maintenance').length,
    insurance_expired: cars.filter(c => c.status === 'insurance_expired').length,
    accident: cars.filter(c => c.status === 'accident').length,
    retired: cars.filter(c => c.status === 'retired').length,
  };

  return {
    totalCars: cars.length,
    totalCustomers,
    totalDrivers,
    currentMonthBookings,
    previousMonthBookings,
    monthlyBookings,
    monthlyRevenue,
    carStatusCounts,
  };
}