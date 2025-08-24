import { List, ActionPanel, Action, Icon } from "@raycast/api";

interface EmptyStateProps {
  onAction?: () => void;
  onOpenPreferences: () => void;
}

export function CredentialsRequiredEmptyView({ onOpenPreferences }: Pick<EmptyStateProps, "onOpenPreferences">) {
  return (
    <List.EmptyView
      icon={Icon.Key}
      title="API Credentials Required"
      description="Please set your Atomberg API Key and Refresh Token in extension preferences"
      actions={
        <ActionPanel>
          <Action title="Open Extension Preferences" onAction={onOpenPreferences} icon={Icon.Gear} />
        </ActionPanel>
      }
    />
  );
}

export function NoDevicesEmptyView({ onAction, onOpenPreferences }: EmptyStateProps) {
  return (
    <List.EmptyView
      icon={Icon.House}
      title="No Devices Found"
      description="No Atomberg devices found in your account"
      actions={
        <ActionPanel>
          {onAction && <Action title="Refresh Devices" onAction={onAction} icon={Icon.ArrowClockwise} />}
          <Action title="Open Extension Preferences" onAction={onOpenPreferences} icon={Icon.Gear} />
        </ActionPanel>
      }
    />
  );
}
