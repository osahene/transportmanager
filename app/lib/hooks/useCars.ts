import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/APIPath';
import { Car } from '@/app/types/cars';
import { snakeToCamel } from '../snakeToCamel';

export const useCars = () => {
  return useQuery<Car[]>({
    queryKey: ['cars'],
    queryFn: async () => {
      const response = await apiService.getCars();
      // Adjust based on your actual API response structure
      return response.data.results.map((item: any) => snakeToCamel(item));
    },
  });
};

export const useCar = (id: string) => {
  return useQuery<Car>({
    queryKey: ['cars', id],
    queryFn: async () => {
      const response = await apiService.getCarById(id);
      return snakeToCamel(response.data.data);
    },
    enabled: !!id,
  });
};

export const useCreateCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newCar: any) => apiService.createCar(newCar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
};

export const useUpdateCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.updateCar(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars', variables.id] });
    },
  });
};

export const useUpdateCarStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiService.updateCarStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars', variables.id] });
    },
  });
};

export const useUpdateCarStatusWithEventPayload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiService.updateCarStatusWithEventPayload(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars', variables.id] });
    },
  });
};