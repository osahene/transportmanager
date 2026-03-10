import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/APIPath';
import { Booking } from '@/app/types/booking';
import { snakeToCamel } from '../snakeToCamel';

export const useBookings = (params?: any) => {
  return useQuery<Booking[]>({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const response = await apiService.fetchBookings(params);
      return response.data.results.map((item: any) => ({
        ...snakeToCamel(item),
        CarId: item.car,
        customerId: item.customer,
      }));
    },
  });
};

export const useBooking = (id: string) => {
  return useQuery<Booking>({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const response = await apiService.getBookingById(id);
      return snakeToCamel(response.data);
    },
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiService.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, refundAmount, reason }: any) =>
      apiService.cancelBooking(bookingId, { refund_amount: refundAmount, reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.bookingId] });
    },
  });
};

export const useMarkBookingAsReturned = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, actualReturnTime, returnMileage }: any) =>
      apiService.markBookingAsReturned(bookingId, {
        actual_return_time: actualReturnTime,
        return_mileage: returnMileage,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.bookingId] });
    },
  });
};

export const useSendSMS = () => {
  return useMutation({
    mutationFn: (bookingId: string) => apiService.sendSMSReceipt(bookingId),
  });
};

export const useSendEmail = () => {
  return useMutation({
    mutationFn: (bookingId: string) => apiService.sendEmailReceipt(bookingId),
  });
};


export const useExtendBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, newEndDate, guarantor }: any) =>
      apiService.extendBooking(bookingId, {
        new_end_date: newEndDate,
        guarantor: guarantor, // optional guarantor data object
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.bookingId] });
    },
  });
};