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

export interface DeviceState {
  device_id: string;
  is_online: boolean;
  power: boolean;
  last_recorded_speed: number;
  timer_hours: number;
  timer_time_elapsed_mins: number;
  ts_epoch_seconds: number;
  last_recorded_brightness: number;
  last_recorded_color: string;
  sleep_mode: boolean;
  led: boolean;
}

export interface DeviceStateResponse {
  status: string;
  message: {
    device_state: DeviceState[];
  };
}

export type DevicesByRoom = Record<string, Device[]>;
