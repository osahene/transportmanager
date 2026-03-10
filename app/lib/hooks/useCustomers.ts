import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/APIPath';
import { Customer } from '@/app/types/customer';
import { snakeToCamel } from '../snakeToCamel';

const getErrorMessage = (error: any) => {
    return error.response?.data?.message || error.message || 'An error occurred';
};

export const useCustomers = () => {
     return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiService.getCustomers();
      return response.data.results.map((item: any) => snakeToCamel(item));
    },
  });
};


export const useCustomer = (id: string) => {
   return useQuery<Customer>({
    queryKey: ['customers', id],
    queryFn: async () => {
        console.log('Fetching customer with ID:', id);
      const response = await apiService.getCustomerById(id);
      console.log('Raw API response for customer:', response.data);
      return snakeToCamel(response.data);
    },
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiService.createCustomer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

export const useSendBulkSMS = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerIds, message }: { customerIds: string[]; message: string }) =>
            apiService.sendBulkSMS(customerIds, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

export const useSendSingleSMS = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, message }: { customerId: string; message: string }) =>
            apiService.sendSingleSMS(customerId, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

export const useCustomerBookingsWithGuarantor = (customerId: string) => {
    return useQuery({
        queryKey: ['customerBookingsWithGuarantor', customerId],
        queryFn: async () => {
            const response = await apiService.getCustomerBookingsWithGuarantor(customerId);
            return response.data.map((item: any) => ({
                ...item,
                customerId: item.customer,
            }));
        },
        enabled: !!customerId,
        select: (data) => {
            return data.map((item: any) => ({
                ...item,
                customerId: item.customer,
            }));
        }
    });
}
