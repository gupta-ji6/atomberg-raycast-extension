import { useDevicesList } from "./useDevicesList";
import { useDeviceControl } from "./useDeviceControl";
import type { Device, Preferences } from "../../types";

export function useAtombergDevices(preferences: Preferences) {
  const { data: devices = [], isLoading, refetch: refreshDevices, error } = useDevicesList(preferences);

  const deviceControlMutation = useDeviceControl(preferences);

  const toggleDevice = async (device: Device) => {
    deviceControlMutation.mutate({ device, command: "toggle" });
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
