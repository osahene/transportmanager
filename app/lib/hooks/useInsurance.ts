import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/APIPath';
import { InsurancePolicy } from '@/app/types/insurance';
import { snakeToCamel } from '../snakeToCamel';

export const useInsurancePolicies = (params?: { vehicleId?: string }) => {
  return useQuery<InsurancePolicy[]>({
    queryKey: ['insurance', params],
    queryFn: async () => {
      const response = await apiService.getInsurancePolicies(params);
      return response.data.results.map((item: any) => snakeToCamel(item));
    },
  });
};

export const useInsurancePolicy = (id: string) => {
  return useQuery<InsurancePolicy>({
    queryKey: ['insurance', id],
    queryFn: async () => {
      // Assuming there's a get by id endpoint, but not in apiService; fallback to filtering
      const response = await apiService.getInsurancePolicies();
      return response.data.results.find((p: any) => p.id === id);
    },
    enabled: !!id,
  });
};

export const useCreateInsurancePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiService.createInsurancePolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] });
    },
  });
};

export const useUpdateInsurancePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, updates }: { policyId: string; updates: any }) =>
      apiService.updateInsurancePolicy(policyId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] });
      queryClient.invalidateQueries({ queryKey: ['insurance', variables.policyId] });
    },
  });
};

export const useRenewInsurancePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, renewalData }: { policyId: string; renewalData: any }) =>
      apiService.renewInsurancePolicy(policyId, renewalData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] });
      queryClient.invalidateQueries({ queryKey: ['insurance', variables.policyId] });
    },
  });
};

export const useExpiringPolicies = (days: number = 30) => {
  return useQuery({
    queryKey: ['insurance', 'expiring', days],
    queryFn: async () => {
      const response = await apiService.getExpiringPolicies(days);
      return response.data.results.map((item: any) => snakeToCamel(item));
    },
  });
};