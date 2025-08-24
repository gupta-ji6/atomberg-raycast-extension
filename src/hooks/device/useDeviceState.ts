import { useQuery } from "@tanstack/react-query";
import { apiServiceManager } from "../../services/api-service";
import { queryKeys } from "../../lib/query-client";
import type { Preferences } from "../../types";

export function useDeviceState(deviceId: string, preferences: Preferences) {
  const apiService = apiServiceManager.getApiService(preferences);

  const {
    data: deviceState,
    isLoading,
    refetch: refreshDeviceState,
    error,
  } = useQuery({
    queryKey: queryKeys.deviceState(deviceId, preferences),
    queryFn: () => apiService.fetchDeviceState(deviceId),
    enabled: !!(deviceId && preferences.apiKey?.trim() && preferences.refreshToken?.trim()),
    staleTime: 10 * 1000, // 10 seconds - device state should be fresh
    refetchInterval: 30 * 1000, // Background refetch every 30 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true, // Refetch when user focuses the window
  });

  return {
    deviceState: deviceState || null,
    isLoading,
    refreshDeviceState,
    error,
  };
}
