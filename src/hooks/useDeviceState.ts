import { useState, useEffect, useCallback, useMemo } from "react";
import { showToast, Toast } from "@raycast/api";
import { AtombergApiService } from "../services/atomberg-api";
import type { DeviceState, Preferences } from "../types";

export function useDeviceState(deviceId: string, preferences: Preferences) {
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiService = useMemo(() => new AtombergApiService(preferences), [preferences.apiKey, preferences.refreshToken]);

  const loadDeviceState = useCallback(async () => {
    try {
      setIsLoading(true);
      const state = await apiService.fetchDeviceState(deviceId);
      console.log("Device state:", JSON.stringify(state, null, 2));
      if (state) {
        setDeviceState(state);
      }
    } catch (error) {
      console.error("Error loading device state:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load device state. Please check your API credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiService, deviceId]);

  const refreshDeviceState = useCallback(async () => {
    await loadDeviceState();
  }, [loadDeviceState]);

  useEffect(() => {
    if (!preferences.apiKey?.trim() || !preferences.refreshToken?.trim()) {
      setIsLoading(false);
      return;
    }

    loadDeviceState();
  }, [apiService, preferences.apiKey, preferences.refreshToken, deviceId]);

  return {
    deviceState,
    isLoading,
    refreshDeviceState,
  };
}
