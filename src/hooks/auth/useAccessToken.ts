import { useQuery } from "@tanstack/react-query";
import { apiServiceManager } from "../../services/api-service";
import { queryKeys } from "../../lib/query-client";
import type { Preferences } from "../../types";

export function useAccessToken(preferences: Preferences) {
  const apiService = apiServiceManager.getApiService(preferences);

  return useQuery({
    queryKey: queryKeys.accessToken(preferences),
    queryFn: () => apiService.getAccessToken(),
    enabled: !!(preferences.apiKey?.trim() && preferences.refreshToken?.trim()),
    staleTime: 20 * 60 * 1000, // 20 minutes - tokens expire in 24 hours
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
  });
}
