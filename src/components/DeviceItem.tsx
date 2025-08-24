import { List, ActionPanel, Action, Icon } from "@raycast/api";
import type { Device } from "../types";

interface DeviceItemProps {
  device: Device;
  onToggle: (device: Device) => void;
  onRefresh: () => void;
  onOpenPreferences: () => void;
}

export function DeviceItem({ device, onToggle, onRefresh, onOpenPreferences }: DeviceItemProps) {
  return (
    <List.Item
      key={device.device_id}
      title={device.name}
      subtitle={`${device.series} ${device.model} • ${device.color}`}
      accessories={[
        {
          icon: Icon.Wifi,
          tooltip: `Connected to ${device.metadata.ssid}`,
        },
      ]}
      icon={Icon.ComputerChip}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="Open Device Commands"
            url={`raycast://extensions/gupta_ji/atomberg/device-commands?arguments=${encodeURIComponent(
              JSON.stringify({
                deviceId: device.device_id,
                deviceName: device.name,
              }),
            )}`}
            icon={Icon.List}
          />
          <Action title="Toggle Device" onAction={() => onToggle(device)} icon={Icon.Power} />
          <Action title="Refresh Devices" onAction={onRefresh} icon={Icon.ArrowClockwise} />
          <Action title="Open Extension Preferences" onAction={onOpenPreferences} icon={Icon.Gear} />
        </ActionPanel>
      }
    />
  );
}
