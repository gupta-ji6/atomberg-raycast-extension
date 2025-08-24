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
          <Action title="Control Device" onAction={() => onToggle(device)} icon={Icon.Power} />
          <Action title="Refresh Devices" onAction={onRefresh} icon={Icon.ArrowClockwise} />
          <Action title="Open Extension Preferences" onAction={onOpenPreferences} icon={Icon.Gear} />
        </ActionPanel>
      }
    />
  );
}
