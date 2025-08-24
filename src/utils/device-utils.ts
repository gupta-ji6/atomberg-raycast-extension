import type { Device, DevicesByRoom } from "../types";

export function groupDevicesByRoom(devices: Device[]): DevicesByRoom {
  return devices.reduce((acc, device) => {
    const room = device.room || "Unknown Room";
    if (!acc[room]) {
      acc[room] = [];
    }
    acc[room].push(device);
    return acc;
  }, {} as DevicesByRoom);
}

export function getSortedRooms(devicesByRoom: DevicesByRoom): string[] {
  return Object.keys(devicesByRoom).sort();
}

export function hasValidCredentials(apiKey?: string, refreshToken?: string): boolean {
  return Boolean(apiKey?.trim() && refreshToken?.trim());
}
