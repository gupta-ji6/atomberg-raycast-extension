import { LocalStorage, showToast, Toast } from "@raycast/api";
import {
  ATOMBERG_API_BASE_URL,
  ENDPOINTS,
  STORAGE_KEYS,
  TOKEN_EXPIRY_HOURS,
  TOKEN_REFRESH_BUFFER_MS,
} from "../constants";
import type { AccessTokenResponse, AtombergApiResponse, Device, DeviceControlResponse, Preferences } from "../types";

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

  async controlDevice(device: Device, command = "toggle"): Promise<boolean> {
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

      showToast({
        title: "Controlling Device",
        message: `Sending command to ${device.name}`,
      });

      const response = await fetch(`${ATOMBERG_API_BASE_URL}${ENDPOINTS.DEVICE_COMMAND}/${device.device_id}/command`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": this.preferences.apiKey || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
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
        message: `Successfully sent command to ${device.name}`,
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
}
