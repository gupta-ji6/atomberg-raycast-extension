import {
  List,
  Detail,
  ActionPanel,
  Action,
  Icon,
  getPreferenceValues,
  openExtensionPreferences,
  LaunchProps,
  showToast,
  Toast,
} from "@raycast/api";
import { useState } from "react";
import { useDeviceState } from "./hooks/useDeviceState";
import { hasValidCredentials } from "./utils/device-utils";
import { AtombergApiService } from "./services/atomberg-api";
import type { Preferences, Device } from "./types";

interface DeviceCommandsArguments {
  deviceId: string;
  deviceName: string;
}

interface DeviceCommand {
  id: string;
  title: string;
  subtitle: string;
  icon: Icon;
  command: string;
  description: string;
}

const DEVICE_COMMANDS: DeviceCommand[] = [
  {
    id: "power-toggle",
    title: "Toggle Power",
    subtitle: "Turn device on/off",
    icon: Icon.Power,
    command: "toggle",
    description: "Toggle the power state of the device",
  },
  {
    id: "speed-up",
    title: "Increase Speed",
    subtitle: "Increase fan speed by 1 level",
    icon: Icon.Plus,
    command: "speed_up",
    description: "Increase the fan speed by one level",
  },
  {
    id: "speed-down",
    title: "Decrease Speed",
    subtitle: "Decrease fan speed by 1 level",
    icon: Icon.Minus,
    command: "speed_down",
    description: "Decrease the fan speed by one level",
  },
  {
    id: "oscillation-toggle",
    title: "Toggle Oscillation",
    subtitle: "Turn oscillation on/off",
    icon: Icon.Repeat,
    command: "oscillation_toggle",
    description: "Toggle the oscillation feature of the fan",
  },
  {
    id: "sleep-mode",
    title: "Toggle Sleep Mode",
    subtitle: "Activate/deactivate sleep mode",
    icon: Icon.Moon,
    command: "sleep_mode",
    description: "Toggle sleep mode for quieter operation",
  },
  {
    id: "led-toggle",
    title: "Toggle LED",
    subtitle: "Turn LED indicators on/off",
    icon: Icon.LightBulb,
    command: "led_toggle",
    description: "Toggle the LED indicators on the device",
  },
  {
    id: "timer-1h",
    title: "Set 1 Hour Timer",
    subtitle: "Auto turn off after 1 hour",
    icon: Icon.Clock,
    command: "timer_1h",
    description: "Set device to automatically turn off after 1 hour",
  },
  {
    id: "timer-2h",
    title: "Set 2 Hour Timer",
    subtitle: "Auto turn off after 2 hours",
    icon: Icon.Clock,
    command: "timer_2h",
    description: "Set device to automatically turn off after 2 hours",
  },
  {
    id: "timer-off",
    title: "Cancel Timer",
    subtitle: "Remove any active timer",
    icon: Icon.XMarkCircle,
    command: "timer_off",
    description: "Cancel any currently active timer",
  },
];

export default function DeviceCommands(props: LaunchProps<{ arguments: DeviceCommandsArguments }>) {
  const { deviceId, deviceName } = props.arguments;
  const preferences = getPreferenceValues<Preferences>();
  const { deviceState, isLoading, refreshDeviceState } = useDeviceState(deviceId, preferences);
  const [selectedCommand, setSelectedCommand] = useState<DeviceCommand | null>(null);

  const credentialsValid = hasValidCredentials(preferences.apiKey, preferences.refreshToken);

  const executeCommand = async (command: DeviceCommand) => {
    if (!credentialsValid) {
      showToast({
        style: Toast.Style.Failure,
        title: "Authentication Required",
        message: "Please configure your API credentials",
      });
      return;
    }

    try {
      showToast({
        title: "Executing Command",
        message: `${command.title} for ${deviceName}`,
      });

      const apiService = new AtombergApiService(preferences);
      const deviceMock: Partial<Device> = { device_id: deviceId, name: deviceName };
      const success = await apiService.controlDevice(deviceMock as Device, command.command);

      if (success) {
        // Refresh device state after command execution
        setTimeout(() => {
          refreshDeviceState();
        }, 1000);
      }
    } catch (error) {
      console.error("Command execution error:", error);
    }
  };


  const getDeviceStateMetadata = () => {
    if (!deviceState) return null;

    return (
      <Detail.Metadata>
        <Detail.Metadata.Label title="Device ID" text={deviceState.device_id} />

        <Detail.Metadata.TagList title="Status">
          <Detail.Metadata.TagList.Item
            text={deviceState.is_online ? "Online" : "Offline"}
            color={deviceState.is_online ? "#00C853" : "#F44336"}
          />
        </Detail.Metadata.TagList>

        <Detail.Metadata.TagList title="Power">
          <Detail.Metadata.TagList.Item
            text={deviceState.power ? "On" : "Off"}
            color={deviceState.power ? "#00C853" : "#F44336"}
          />
        </Detail.Metadata.TagList>

        <Detail.Metadata.TagList title="Speed">
          <Detail.Metadata.TagList.Item
            text={deviceState.last_recorded_speed === 0 ? "Off" : `Level ${deviceState.last_recorded_speed}`}
            color={deviceState.last_recorded_speed === 0 ? "#9E9E9E" : "#4CAF50"}
          />
        </Detail.Metadata.TagList>


        {deviceState.timer_hours > 0 && (
          <>
            <Detail.Metadata.Label title="Timer Remaining" text={`${deviceState.timer_hours} hours`} />
            <Detail.Metadata.Label title="Timer Elapsed" text={`${deviceState.timer_time_elapsed_mins} minutes`} />
          </>
        )}

        {deviceState.last_recorded_brightness && (
          <Detail.Metadata.Label title="Brightness" text={deviceState.last_recorded_brightness.toString()} />
        )}

        {deviceState.last_recorded_color && (
          <Detail.Metadata.Label title="Color" text={deviceState.last_recorded_color} />
        )}

        <Detail.Metadata.Label
          title="Last Updated"
          text={new Date(deviceState.ts_epoch_seconds * 1000).toLocaleString()}
        />

        <Detail.Metadata.TagList title="Active Features">
          {deviceState.sleep_mode && <Detail.Metadata.TagList.Item text="Sleep Mode" color="#9C27B0" />}
          {deviceState.led && <Detail.Metadata.TagList.Item text="LED" color="#FFC107" />}
          {!deviceState.sleep_mode && !deviceState.led && (
            <Detail.Metadata.TagList.Item text="None Active" color="#9E9E9E" />
          )}
        </Detail.Metadata.TagList>
      </Detail.Metadata>
    );
  };

  if (!credentialsValid) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.Key}
          title="API Credentials Required"
          description="Please set your Atomberg API Key and Refresh Token in extension preferences"
          actions={
            <ActionPanel>
              <Action title="Open Extension Preferences" onAction={openExtensionPreferences} icon={Icon.Gear} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search device commands..."
      isShowingDetail={true}
      selectedItemId={selectedCommand?.id}
      onSelectionChange={(id) => {
        const command = DEVICE_COMMANDS.find((cmd) => cmd.id === id);
        setSelectedCommand(command || null);
      }}
      navigationTitle={`${deviceName} Controls`}
    >
      {DEVICE_COMMANDS.map((command) => (
        <List.Item
          key={command.id}
          id={command.id}
          title={command.title}
          subtitle={command.subtitle}
          icon={command.icon}
          detail={
            <List.Item.Detail
              isLoading={isLoading}
              metadata={getDeviceStateMetadata()}
            />
          }
          actions={
            <ActionPanel>
              <Action
                title={`Execute: ${command.title}`}
                onAction={() => executeCommand(command)}
                icon={command.icon}
              />
              <Action title="Refresh Device State" onAction={refreshDeviceState} icon={Icon.ArrowClockwise} />
              <Action title="Open Extension Preferences" onAction={openExtensionPreferences} icon={Icon.Gear} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
