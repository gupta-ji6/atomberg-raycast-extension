import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/query-client";
import type { Preferences } from "../../types";

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
