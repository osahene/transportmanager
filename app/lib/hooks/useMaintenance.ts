import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/APIPath';
import { MaintenanceRecord } from '@/app/types/maintenance';
import { snakeToCamel } from '../snakeToCamel';

// Assuming there are endpoints for maintenance; if not, we need to create them.
// For now, we'll simulate with placeholder – you may need to adjust based on actual API.

export const useMaintenanceRecords = (params?: any) => {
  return useQuery<MaintenanceRecord[]>({
    queryKey: ['maintenance', params],
    queryFn: async () => {
      // If apiService doesn't have getMaintenance, you'll need to add it.
      // For now, we'll assume a method exists.
      const response = await apiService.getMaintenanceRecords(params);
      
      return response.data.results.map((item: any) => snakeToCamel(item));
    },
  });
};

export const useMaintenanceRecord = (id: string) => {
  return useQuery<MaintenanceRecord>({
    queryKey: ['maintenance', id],
    queryFn: async () => {
      const response = await apiService.getMaintenanceRecords(id);
      return snakeToCamel(response.data);
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
    mutationFn: ({ id, actualEndDate }: { id: string; actualEndDate: any }) =>
      apiService.completeMaintenance(id, actualEndDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', variables.id] });
    },
  });
};

export const useExtendMaintenanceDeadline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, newEstimatedDate, reason }: any) =>
      apiService.extendMaintenanceDeadline(recordId, { new_estimated_date: newEstimatedDate, reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', variables.recordId] });
    },
  });
};

