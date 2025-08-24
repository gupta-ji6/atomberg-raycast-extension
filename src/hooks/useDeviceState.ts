import { useDeviceState as useDeviceStateQuery } from "./useAtombergQuery";
import type { Preferences } from "../types";

export function useDeviceState(deviceId: string, preferences: Preferences) {
  const { 
    data: deviceState, 
    isLoading, 
    refetch: refreshDeviceState,
    error 
  } = useDeviceStateQuery(deviceId, preferences);

  return {
    deviceState: deviceState || null,
    isLoading,
    refreshDeviceState,
    error,
  };
}
