import { useMemo } from 'react';
import { useAppSelector } from '../store';
import { useBookings } from './useBookings';
import { useCars } from './useCars';
import { useCustomers } from './useCustomers';

export const useDetailedBookings = () => {
  const { data: onlineBookings = [], isLoading: bookingsLoading, error: bookingsError } = useBookings();
  const { data: cars = [], isLoading: carsLoading } = useCars();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();

  const pendingSync = useAppSelector((state) => state.bookings.pendingSync);

  const isLoading = bookingsLoading || carsLoading || customersLoading;

  const allBookings = useMemo(() => {
    return [...onlineBookings, ...pendingSync];
  }, [onlineBookings, pendingSync]);

  const detailedBookings = useMemo(() => {
    return allBookings.map((booking) => {
      const car = cars.find((c) => c.id === booking.CarId) || null;
      const customer = customers.find((c) => c.id === (booking.customerId as unknown as { id: string }).id) || null;
      return {
        ...booking,
        car,
        customer,
        carMake: car?.make || 'Unknown',
        carModel: car?.model || 'Unknown',
        carlicense_plate: car?.license_plate || 'N/A',
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer',
        customerEmail: customer?.email || 'N/A',
        customerPhone: customer?.phone || 'N/A',
      };
    });
  }, [allBookings, cars, customers]);

  return { data: detailedBookings, isLoading, error: bookingsError };
};