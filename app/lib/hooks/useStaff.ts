import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/APIPath';
import { Staff } from '@/app/types/staff';
import { snakeToCamel } from '../snakeToCamel';

export const useStaff = () => {
  return useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await apiService.getStaff();
      return response.data.results.map((item: any) => snakeToCamel(item));
    },
  });
};

export const useStaffMember = (id: string) => {
  return useQuery<Staff>({
    queryKey: ['staff', id],
    queryFn: async () => {
      const response = await apiService.getStaffById(id);
      return snakeToCamel(response.data.results);
    },
    enabled: !!id,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

export const useUpdateStaffStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, data }: { id: string; action: string; data?: any }) =>
      apiService.updateStaffStatus(id, action, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', variables.id] });
    },
  });
};

export const useSalaryHistory = (staffId: string) => {
  return useQuery({
    queryKey: ['staff', staffId, 'salaryHistory'],
    queryFn: async () => {
      const response = await apiService.getSalaryHistory(staffId);
      return snakeToCamel(response.data.results);
    },
    enabled: !!staffId,
  });
};

export const useCreateSalaryPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiService.createSalaryPayment(data),
    onSuccess: (_, variables) => {
      // Invalidate salary history for that staff member
      queryClient.invalidateQueries({ queryKey: ['staff', variables.staff, 'salaryHistory'] });
    },
  });
};

export const useDriverBookings = (driverId: string) => {
  return useQuery({
    queryKey: ['driverBookings', driverId],
    queryFn: async () => {
      const response = await apiService.getDriverBookings(driverId);
      return snakeToCamel(response.data.results);
    },
    enabled: !!driverId,
  });
};