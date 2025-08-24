import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast, Toast } from '@raycast/api';
import { AtombergApiService } from '../services/atomberg-api';
import { queryKeys } from '../lib/query-client';
import type { Device, Preferences } from '../types';

// Hook for device list with longer cache time
export function useDevicesList(preferences: Preferences) {
  const apiService = new AtombergApiService(preferences);
  
  return useQuery({
    queryKey: queryKeys.devicesList(preferences),
    queryFn: () => apiService.fetchDevices(),
    enabled: !!(preferences.apiKey?.trim() && preferences.refreshToken?.trim()),
    staleTime: 5 * 60 * 1000, // 5 minutes - device list doesn't change often
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    refetchOnWindowFocus: false, // Don't refetch when switching windows
  });
}

// Hook for device state with short cache time and background updates
export function useDeviceState(deviceId: string, preferences: Preferences) {
  const apiService = new AtombergApiService(preferences);
  
  return useQuery({
    queryKey: queryKeys.deviceState(deviceId, preferences),
    queryFn: () => apiService.fetchDeviceState(deviceId),
    enabled: !!(deviceId && preferences.apiKey?.trim() && preferences.refreshToken?.trim()),
    staleTime: 10 * 1000, // 10 seconds - device state should be fresh
    refetchInterval: 30 * 1000, // Background refetch every 30 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true, // Refetch when user focuses the window
  });
}

// Hook for device control with optimistic updates
export function useDeviceControl(preferences: Preferences) {
  const queryClient = useQueryClient();
  const apiService = new AtombergApiService(preferences);

  return useMutation({
    mutationFn: async ({ device, command }: { device: Device; command: string }) => {
      return apiService.controlDevice(device, command);
    },
    onMutate: async ({ device }: { device: Device; command: string }) => {
      // Show immediate feedback
      showToast({
        title: "Executing Command",
        message: `Controlling ${device.name}...`,
      });
    },
    onSuccess: async (success: boolean, { device }: { device: Device; command: string }) => {
      if (success) {
        showToast({
          title: "Command Executed",
          message: `Successfully controlled ${device.name}`,
        });
        
        // Invalidate device state to trigger refetch
        await queryClient.invalidateQueries({
          queryKey: queryKeys.deviceState(device.device_id, preferences)
        });
      }
    },
    onError: (error: Error, { device }: { device: Device; command: string }) => {
      console.error("Device control error:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Command Failed",
        message: `Failed to control ${device.name}`,
      });
    },
  });
}

// Hook for access token management
export function useAccessToken(preferences: Preferences) {
  const apiService = new AtombergApiService(preferences);
  
  return useQuery({
    queryKey: queryKeys.accessToken(preferences),
    queryFn: () => apiService.getAccessToken(),
    enabled: !!(preferences.apiKey?.trim() && preferences.refreshToken?.trim()),
    staleTime: 20 * 60 * 1000, // 20 minutes - tokens expire in 24 hours
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
  });
}

// Utility hook to invalidate all device-related queries
export function useInvalidateDeviceQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices });
    },
    invalidateDevicesList: (preferences: Preferences) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devicesList(preferences) });
    },
    invalidateDeviceState: (deviceId: string, preferences: Preferences) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deviceState(deviceId, preferences) });
    },
  };
}