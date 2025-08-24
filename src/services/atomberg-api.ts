import { LocalStorage, showToast, Toast } from "@raycast/api";
import {
  ATOMBERG_API_BASE_URL,
  ENDPOINTS,
  STORAGE_KEYS,
  TOKEN_EXPIRY_HOURS,
  TOKEN_REFRESH_BUFFER_MS,
} from "../constants";
import type {
  AccessTokenResponse,
  AtombergApiResponse,
  Device,
  DeviceControlResponse,
  DeviceState,
  DeviceStateResponse,
  Preferences,
  DeviceCommand,
  CommandParameters,
} from "../types";

export class AtombergApiService {
  constructor(private preferences: Preferences) {}

  async getAccessToken(): Promise<string | null> {
    try {
      const endpoint = `${ATOMBERG_API_BASE_URL}${ENDPOINTS.GET_ACCESS_TOKEN}`;
      console.log("Attempting authentication with endpoint:", endpoint);
      console.log("Using refresh token length:", this.preferences.refreshToken?.length || 0);
      console.log("Using API key length:", this.preferences.apiKey?.length || 0);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.preferences.refreshToken}`,
          "x-api-key": this.preferences.apiKey || "",
          "Content-Type": "application/json",
        },
      });

      console.log("Auth response status:", response.status);
      console.log("Auth response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Auth error response:", errorText);
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as AccessTokenResponse;
      console.log("Access token response data:", data);

      if (data.status === "Success" && data.message?.access_token) {
        const expiryTime = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;

        await LocalStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.message.access_token);
        await LocalStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

        return data.message.access_token;
      } else {
        console.log("Invalid response structure:", data);
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error getting access token:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Authentication Error",
        message: "Failed to authenticate with Atomberg API. Please check your credentials.",
      });
      return null;
    }
  }

  async getValidAccessToken(): Promise<string | null> {
    try {
      const storedToken = await LocalStorage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
      const storedExpiry = await LocalStorage.getItem<string>(STORAGE_KEYS.TOKEN_EXPIRY);

      if (storedToken && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        const now = Date.now();

        if (now < expiryTime - TOKEN_REFRESH_BUFFER_MS) {
          return storedToken;
        }
      }

      return await this.getAccessToken();
    } catch (error) {
      console.error("Error managing access token:", error);
      return await this.getAccessToken();
    }
  }

  async fetchDevices(): Promise<Device[] | null> {
    try {
      showToast({ title: "Authenticating", message: "Getting access token..." });

      const accessToken = await this.getValidAccessToken();
      if (!accessToken) {
        return null;
      }

      showToast({ title: "Loading Devices", message: "Fetching your Atomberg devices..." });

      const response = await fetch(`${ATOMBERG_API_BASE_URL}${ENDPOINTS.GET_DEVICES}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": this.preferences.apiKey || "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Device list API error:", response.status, errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as AtombergApiResponse;
      console.log("Device list response:", data);

      if (data.status !== "Success" || !data.message?.devices_list) {
        throw new Error("Failed to fetch devices - invalid response format");
      }

      const devices = data.message.devices_list;

      showToast({ title: "Devices Loaded", message: `Found ${devices.length} devices` });
      return devices;
    } catch (error) {
      console.error("Error fetching devices:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Load Devices",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });

      return null;
    }
  }

  async controlDevice(
    device: Device,
    command: string | DeviceCommand,
    deviceState?: DeviceState,
    parameters?: CommandParameters,
  ): Promise<boolean> {
    try {
      const accessToken = await this.getValidAccessToken();
      if (!accessToken) {
        showToast({
          style: Toast.Style.Failure,
          title: "Authentication Error",
          message: "Unable to authenticate with Atomberg API",
        });
        return false;
      }

      const commandPayload = this.buildCommandPayload(command, device.device_id, deviceState, parameters);
      const commandDescription = this.getCommandDescription(commandPayload);

      console.log("Command payload:", commandPayload);

      showToast({
        title: "Controlling Device",
        message: `Sending ${commandDescription} to ${device.name}`,
      });

      const response = await fetch(`${ATOMBERG_API_BASE_URL}${ENDPOINTS.SEND_COMMAND}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": this.preferences.apiKey || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commandPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Device control error:", response.status, errorText);
        throw new Error(`Command failed: ${response.status} - ${errorText}`);
      }

      const responseData = (await response.json()) as DeviceControlResponse;
      console.log("Device control response:", responseData);

      showToast({
        title: "Command Sent",
        message: `Successfully sent ${commandDescription} to ${device.name}`,
      });

      return true;
    } catch (error) {
      console.error("Error controlling device:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: `Failed to control ${device.name}`,
      });
      return false;
    }
  }

  private buildCommandPayload(
    command: string | DeviceCommand,
    deviceId: string,
    deviceState?: DeviceState,
    parameters?: CommandParameters,
  ): { device_id: string; command: Record<string, string | number | boolean> } {
    const basePayload = { device_id: deviceId };

    if (typeof command === "string") {
      switch (command) {
        case "toggle":
          if (!deviceState) throw new Error("Device state required for toggle command");
          return { ...basePayload, command: { power: !deviceState.power } };
        case "speed_up":
          return { ...basePayload, command: { speedDelta: 1 } };
        case "speed_down":
          return { ...basePayload, command: { speedDelta: -1 } };
        // Note: oscillation_toggle command does not exist in API documentation - removed
        case "sleep_mode":
          if (!deviceState) throw new Error("Device state required for sleep mode toggle");
          return { ...basePayload, command: { sleep: !deviceState.sleep_mode } };
        case "led_toggle":
          if (!deviceState) throw new Error("Device state required for LED toggle");
          return { ...basePayload, command: { led: !deviceState.led } };
        case "timer_1h":
          return { ...basePayload, command: { timer: 1 } };
        case "timer_2h":
          return { ...basePayload, command: { timer: 2 } };
        case "timer_3h":
          return { ...basePayload, command: { timer: 3 } };
        case "timer_6h":
          return { ...basePayload, command: { timer: 4 } };
        case "timer_off":
          return { ...basePayload, command: { timer: 0 } };
        case "brightness_up":
          return { ...basePayload, command: { brightnessDelta: 10 } };
        case "brightness_down":
          return { ...basePayload, command: { brightnessDelta: -10 } };
        case "set_speed":
          if (!parameters?.speed_level) throw new Error("Speed level parameter required for set_speed command");
          return { ...basePayload, command: { speed: parameters.speed_level } };
        case "set_timer":
          if (!parameters?.timer_hours) throw new Error("Timer hours parameter required for set_timer command");
          return { ...basePayload, command: { timer: parameters.timer_hours } };
        case "set_brightness":
          if (!parameters?.brightness_level)
            throw new Error("Brightness level parameter required for set_brightness command");
          return { ...basePayload, command: { brightness: parameters.brightness_level } };
        case "set_brightness_delta":
          if (!parameters?.brightness_delta)
            throw new Error("Brightness delta parameter required for set_brightness_delta command");
          return { ...basePayload, command: { brightnessDelta: parameters.brightness_delta } };
        case "set_color":
          if (!parameters?.color) throw new Error("Color parameter required for set_color command");
          return { ...basePayload, command: { light_mode: parameters.color } };
        default:
          throw new Error(`Unknown simple command: ${command}`);
      }
    }

    switch (command.command) {
      case "set_speed":
        return {
          ...basePayload,
          command: { speed: command.speed_level },
        };
      case "set_timer":
        return {
          ...basePayload,
          command: { timer: command.timer_hours },
        };
      case "set_brightness":
        return {
          ...basePayload,
          command: { brightness: command.brightness_level },
        };
      case "set_brightness_delta":
        return {
          ...basePayload,
          command: { brightnessDelta: command.brightness_delta },
        };
      case "set_color":
        return {
          ...basePayload,
          command: { light_mode: command.color },
        };
      default:
        throw new Error(`Unknown parametrized command: ${command.command}`);
    }
  }

  private getCommandDescription(payload: {
    device_id: string;
    command: Record<string, string | number | boolean>;
  }): string {
    const cmd = payload.command;

    if ("power" in cmd) return "power toggle";
    if ("speedDelta" in cmd) {
      const delta = cmd.speedDelta as number;
      return delta > 0 ? "speed increase" : "speed decrease";
    }
    if ("speed" in cmd) return `speed level ${cmd.speed}`;
    if ("sleep" in cmd) return "sleep mode toggle";
    if ("led" in cmd) return "LED toggle";
    if ("timer" in cmd) {
      const hours = cmd.timer as number;
      return hours === 0 ? "timer cancellation" : `${hours} hour timer`;
    }
    if ("brightness" in cmd) return `brightness level ${cmd.brightness}`;
    if ("brightnessDelta" in cmd) {
      const delta = cmd.brightnessDelta as number;
      return delta > 0 ? "brightness increase" : "brightness decrease";
    }
    if ("light_mode" in cmd) return `color ${cmd.light_mode}`;

    return "command";
  }

  async fetchDeviceState(deviceId: string): Promise<DeviceState | null> {
    try {
      const accessToken = await this.getValidAccessToken();
      if (!accessToken) {
        return null;
      }

      const response = await fetch(`${ATOMBERG_API_BASE_URL}${ENDPOINTS.GET_DEVICE_STATE}?device_id=${deviceId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": this.preferences.apiKey || "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Device state API error:", response.status, errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as DeviceStateResponse;
      console.log("Device state response:", JSON.stringify(data, null, 2));

      if (data.status !== "Success" || !data.message?.device_state) {
        throw new Error("Failed to fetch device state - invalid response format");
      }

      return data.message.device_state?.[0] || null;
    } catch (error) {
      console.error("Error fetching device state:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Load Device State",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });

      return null;
    }
  }
}
