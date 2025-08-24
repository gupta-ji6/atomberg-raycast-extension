import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast, Toast } from "@raycast/api";
import { apiServiceManager } from "../../services/api-service";
import { queryKeys } from "../../lib/query-client";
import type { Device, Preferences } from "../../types";

export function useDeviceControl(preferences: Preferences) {
  const queryClient = useQueryClient();
  const apiService = apiServiceManager.getApiService(preferences);

  return useMutation({
    mutationFn: async ({ device, command }: { device: Device; command: string }) => {
      return apiService.controlDevice(device, command);
    },
    onMutate: async ({ device }: { device: Device; command: string }) => {
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

        await queryClient.invalidateQueries({
          queryKey: queryKeys.deviceState(device.device_id, preferences),
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
