import { useState, useEffect, useCallback, useMemo } from "react";
import { showToast, Toast } from "@raycast/api";
import { AtombergApiService } from "../services/atomberg-api";
import type { Device, Preferences } from "../types";

export function useAtombergDevices(preferences: Preferences) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const apiService = useMemo(() => new AtombergApiService(preferences), [preferences.apiKey, preferences.refreshToken]);

  const loadDevices = useCallback(async () => {
    try {
      const deviceList = await apiService.fetchDevices();
      if (deviceList) {
        setDevices(deviceList);
      }
    } catch (error) {
      console.error("Error loading devices:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load devices. Please check your API credentials in preferences.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const refreshDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const deviceList = await apiService.fetchDevices();
      if (deviceList) {
        setDevices(deviceList);
      }
    } catch (error) {
      console.error("Error refreshing devices:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to refresh device list",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const toggleDevice = useCallback(
    async (device: Device) => {
      await apiService.controlDevice(device);
    },
    [apiService],
  );

  useEffect(() => {
    if (!preferences.apiKey?.trim() || !preferences.refreshToken?.trim()) {
      setIsLoading(false);
      return;
    }

    loadDevices();
  }, [apiService, preferences.apiKey, preferences.refreshToken]);

  return {
    devices,
    isLoading,
    refreshDevices,
    toggleDevice,
  };
}
