import { useQuery } from "@tanstack/react-query";
import { apiServiceManager } from "../../services/api-service";
import { queryKeys } from "../../lib/query-client";
import type { Preferences } from "../../types";

export function useDevicesList(preferences: Preferences) {
  const apiService = apiServiceManager.getApiService(preferences);

  return useQuery({
    queryKey: queryKeys.devicesList(preferences),
    queryFn: () => apiService.fetchDevices(),
    enabled: !!(preferences.apiKey?.trim() && preferences.refreshToken?.trim()),
    staleTime: 5 * 60 * 1000, // 5 minutes - device list doesn't change often
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    refetchOnWindowFocus: false, // Don't refetch when switching windows
  });
}
