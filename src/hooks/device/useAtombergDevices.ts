import { useDevicesList } from "./useDevicesList";
import { useDeviceControl } from "./useDeviceControl";
import { apiServiceManager } from "../../services/api-service";
import type { Device, Preferences } from "../../types";

export function useAtombergDevices(preferences: Preferences) {
  const { data: devices = [], isLoading, refetch: refreshDevices, error } = useDevicesList(preferences);

  const deviceControlMutation = useDeviceControl(preferences);

  const toggleDevice = async (device: Device) => {
    try {
      // Fetch current device state first
      const apiService = apiServiceManager.getApiService(preferences);
      const deviceState = await apiService.fetchDeviceState(device.device_id);

      if (deviceState) {
        deviceControlMutation.mutate({ device, command: "toggle", deviceState });
      } else {
        throw new Error("Failed to fetch device state");
      }
    } catch (error) {
      console.error("Error toggling device:", error);
      // Fallback to old behavior if state fetch fails
      deviceControlMutation.mutate({ device, command: "toggle" });
    }
  };

  return {
    devices,
    isLoading,
    refreshDevices,
    toggleDevice,
    error,
    isControlling: deviceControlMutation.isPending,
  };
}
