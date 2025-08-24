export interface Device {
  device_id: string;
  name: string;
  model: string;
  series: string;
  color: string;
  room: string;
  metadata: {
    ssid: string;
  };
}

export interface Preferences {
  apiKey?: string;
  refreshToken?: string;
}

export interface AccessTokenResponse {
  status: string;
  message: {
    access_token: string;
  };
}

export interface AtombergApiResponse {
  status: string;
  message: {
    devices_list: Device[];
  };
}

export interface DeviceControlResponse {
  status: string;
  message?: string;
}

export type DevicesByRoom = Record<string, Device[]>;
