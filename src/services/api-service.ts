import { AtombergApiService } from "./atomberg-api";
import type { Preferences } from "../types";

class ApiServiceManager {
  private static instance: ApiServiceManager;
  private apiInstances = new Map<string, AtombergApiService>();

  private constructor() {}

  static getInstance(): ApiServiceManager {
    if (!ApiServiceManager.instance) {
      ApiServiceManager.instance = new ApiServiceManager();
    }
    return ApiServiceManager.instance;
  }

  getApiService(preferences: Preferences): AtombergApiService {
    const key = this.createKey(preferences);

    if (!this.apiInstances.has(key)) {
      this.apiInstances.set(key, new AtombergApiService(preferences));
    }

    return this.apiInstances.get(key)!;
  }

  private createKey(preferences: Preferences): string {
    return `${preferences.apiKey || ""}-${preferences.refreshToken || ""}`;
  }

  clearCache(): void {
    this.apiInstances.clear();
  }
}

export const apiServiceManager = ApiServiceManager.getInstance();
