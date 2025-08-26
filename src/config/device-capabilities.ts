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
  renesa_r1: {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Renesa Halo series
  renesa_halo_r1: {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },
  renesa_halo_r2: {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Renesa+ series
  "renesa+_r1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  "studio+_r1": {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Erica series
  erica_k1: {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Aris Starlight I1 series (ONLY model supporting both brightness AND color)
  aris_starlight_i1: {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: true,
    color: true,
  },

  // Aris I2 series (basic features only)
  aris_i2: {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: false,
    color: false,
  },

  // Aris Contour M1 series (supports brightness change only)
  aris_contour_m1: {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: true,
    color: false,
  },

  // Renesa Elite S1 series (supports brightness change only)
  renesa_elite_s1: {
    power: true,
    speed: true,
    sleep: true,
    timer: true,
    led: true,
    brightness: true,
    color: false,
  },

  // Studio Nexus S1 series (supports brightness change only)
  studio_nexus_s1: {
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
  // Convert API response to lowercase and use underscores for consistency
  const normalizedModel = device.model.toLowerCase();
  const normalizedSeries = device.series.toLowerCase();
  const exactKey = `${normalizedModel}_${normalizedSeries}`;

  // Try exact match first
  if (DEVICE_CAPABILITIES[exactKey]) {
    return DEVICE_CAPABILITIES[exactKey];
  }

  // Try case-insensitive match as fallback
  const caseInsensitiveKey = Object.keys(DEVICE_CAPABILITIES).find(
    (key) => key.toLowerCase() === exactKey.toLowerCase(),
  );
  if (caseInsensitiveKey) {
    return DEVICE_CAPABILITIES[caseInsensitiveKey];
  }

  // Try partial match by series only (fallback for unknown models)
  const seriesOnlyKey = Object.keys(DEVICE_CAPABILITIES).find((key) =>
    key.toLowerCase().endsWith(`_${normalizedSeries}`),
  );
  if (seriesOnlyKey) {
    console.log(`Using series-based fallback for ${device.model} ${device.series}: ${seriesOnlyKey}`);
    return DEVICE_CAPABILITIES[seriesOnlyKey];
  }

  return DEFAULT_CAPABILITIES;
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
