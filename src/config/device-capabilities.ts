import type { Device } from "../types";

export interface DeviceCapabilities {
  power: boolean;
  speed: boolean;
  sleep: boolean;
  timer: boolean;
  led: boolean;
  brightness: boolean;
  color: boolean;
}

// Device capability mapping based on model and series from API documentation
const DEVICE_CAPABILITIES: Record<string, DeviceCapabilities> = {
  // Renesa series
  "Renesa-R1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Renesa Halo series
  "Renesa Halo-R1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },
  "Renesa Halo-R2": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Renesa+ series
  "Renesa+-R1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Studio+ series
  "Studio+-R1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Erica series
  "Erica-K1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Aris Starlight I1 series (ONLY model supporting both brightness AND color)
  "Aris Starlight-I1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: true,
    color: true,
  },

  // Aris I2 series (basic features only)
  "Aris-I2": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Aris Contour M1 series (supports brightness change only)
  "Aris Contour-M1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: true,
    color: false,
  },

  // Renesa Elite S1 series (supports brightness change only)
  "Renesa Elite-S1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: true,
    color: false,
  },

  // Studio Nexus S1 series (supports brightness change only)
  "Studio Nexus-S1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: true,
    color: false,
  },
};

// Default capabilities for unknown models
const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  power: true,
  speed: true,
  sleep: true,
  timer: true,
  led: true,
  brightness: false,
  color: false,
};

export function getDeviceCapabilities(device: Device): DeviceCapabilities {
  const modelKey = `${device.model}-${device.series}`;
  return DEVICE_CAPABILITIES[modelKey] || DEFAULT_CAPABILITIES;
}

export function hasCapability(device: Device, capability: keyof DeviceCapabilities): boolean {
  const capabilities = getDeviceCapabilities(device);
  return capabilities[capability];
}

export function getSupportedCapabilities(device: Device): (keyof DeviceCapabilities)[] {
  const capabilities = getDeviceCapabilities(device);
  return Object.entries(capabilities)
    .filter(([, supported]) => supported)
    .map(([capability]) => capability as keyof DeviceCapabilities);
}
