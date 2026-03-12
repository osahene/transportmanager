import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/APIPath';
import { MaintenanceRecord } from '@/app/types/maintenance';
import { snakeToCamel } from '../snakeToCamel';


export const useMaintenanceRecords = (id: string) => {
  return useQuery<MaintenanceRecord[]>({
    queryKey: ['maintenance', id],
    queryFn: async () => {
      console.log('Fetching maintenance records for car ID:', id);
      const response = await apiService.getMaintenanceRecords(id);
      console.log('Maintenance API response:', response);
      return response.data.map((item: any) => snakeToCamel(item));
    },
    enabled: !!id,
  });
};

export const useCreateMaintenanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiService.createMaintenanceRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
};

export const useUpdateMaintenanceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
      mutationFn: ({ recordId, newEstimatedDate, reason }: any) =>
      apiService.updateMaintenanceStatus(recordId, { new_estimated_date: newEstimatedDate, reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', variables.recordId] });
    },
  });
};

export const useCompleteMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actualEndDate }: { id: string; actualEndDate?: string }) =>
      apiService.completeMaintenance(id, { actual_end_date: actualEndDate }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', variables.id] });
    },
  });
};

export const useExtendMaintenanceDeadline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, newEstimatedDate, reason }: { recordId: string; newEstimatedDate: string; reason: string }) =>
      apiService.extendMaintenanceDeadline(recordId, {
        new_estimated_date: newEstimatedDate,
        reason,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', variables.recordId] });
    },
  });
};
