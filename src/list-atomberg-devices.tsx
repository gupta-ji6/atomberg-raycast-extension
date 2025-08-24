import { List, getPreferenceValues, openExtensionPreferences } from "@raycast/api";
import { DeviceItem } from "./components/DeviceItem";
import { CredentialsRequiredEmptyView, NoDevicesEmptyView } from "./components/EmptyStates";
import { useAtombergDevices } from "./hooks/useAtombergDevices";
import { groupDevicesByRoom, getSortedRooms, hasValidCredentials } from "./utils/device-utils";
import type { Preferences } from "./types";

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const { devices, isLoading, refreshDevices, toggleDevice } = useAtombergDevices(preferences);

  const credentialsValid = hasValidCredentials(preferences.apiKey, preferences.refreshToken);

  if (!credentialsValid && !isLoading) {
    return (
      <List>
        <CredentialsRequiredEmptyView onOpenPreferences={openExtensionPreferences} />
      </List>
    );
  }

  const devicesByRoom = groupDevicesByRoom(devices);
  const sortedRooms = getSortedRooms(devicesByRoom);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search devices...">
      {devices.length === 0 && !isLoading ? (
        <NoDevicesEmptyView onAction={refreshDevices} onOpenPreferences={openExtensionPreferences} />
      ) : (
        sortedRooms.map((room) => (
          <List.Section key={room} title={room}>
            {devicesByRoom[room].map((device) => (
              <DeviceItem
                key={device.device_id}
                device={device}
                onToggle={toggleDevice}
                onRefresh={refreshDevices}
                onOpenPreferences={openExtensionPreferences}
              />
            ))}
          </List.Section>
        ))
      )}
    </List>
  );
}
