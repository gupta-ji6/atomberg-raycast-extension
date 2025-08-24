import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast, Toast } from "@raycast/api";
import { apiServiceManager } from "../../services/api-service";
import { queryKeys } from "../../lib/query-client";
import type { Device, Preferences, DeviceCommand, DeviceState, CommandParameters } from "../../types";

export function useDeviceControl(preferences: Preferences) {
  const queryClient = useQueryClient();
  const apiService = apiServiceManager.getApiService(preferences);

  return useMutation({
    mutationFn: async ({
      device,
      command,
      deviceState,
      parameters,
    }: {
      device: Device;
      command: string | DeviceCommand;
      deviceState?: DeviceState;
      parameters?: CommandParameters;
    }) => {
      return apiService.controlDevice(device, command, deviceState, parameters);
    },
    onMutate: async ({
      device,
      command,
    }: {
      device: Device;
      command: string | DeviceCommand;
      deviceState?: DeviceState;
      parameters?: CommandParameters;
    }) => {
      const commandName = typeof command === "string" ? command : command.command;
      showToast({
        title: "Executing Command",
        message: `Controlling ${device.name} - ${commandName}`,
      });
    },
    onSuccess: async (
      success: boolean,
      {
        device,
        command,
      }: {
        device: Device;
        command: string | DeviceCommand;
        deviceState?: DeviceState;
        parameters?: CommandParameters;
      },
    ) => {
      if (success) {
        const commandName = typeof command === "string" ? command : command.command;
        showToast({
          title: "Command Executed",
          message: `Successfully executed ${commandName} on ${device.name}`,
        });

        // Invalidate and refetch device state after a short delay to ensure API state is updated
        await queryClient.invalidateQueries({
          queryKey: queryKeys.deviceState(device.device_id, preferences),
        });

        // Force refetch after 1 second to ensure we get the updated state
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: queryKeys.deviceState(device.device_id, preferences),
          });
        }, 1000);
      }
    },
    onError: (
      error: Error,
      {
        device,
        command,
      }: {
        device: Device;
        command: string | DeviceCommand;
        deviceState?: DeviceState;
        parameters?: CommandParameters;
      },
    ) => {
      const commandName = typeof command === "string" ? command : command.command;
      console.error("Device control error:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Command Failed",
        message: `Failed to execute ${commandName} on ${device.name}`,
      });
    },
  });
}
